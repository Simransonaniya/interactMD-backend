import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SessionStatus, SessionStage, EventType } from '@prisma/client';
import { MEMORY_SESSIONS } from '../simulation/session-store';
import { BENCHMARK_CASES } from '../common/clinical-cases.data';

@Injectable()
export class EvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateSession(sessionId: string) {
    let session: any = null;

    if (this.prisma.isAvailable) {
      try {
        session = await this.prisma.simulationSession.findUnique({
          where: { id: sessionId },
          include: {
            case: true,
            caseVersion: true,
            messages: { orderBy: { timestamp: 'asc' } },
            events: { orderBy: { timestamp: 'asc' } },
            evaluation: true,
          },
        });
      } catch {
        // Fallback
      }
    }

    const memSession = MEMORY_SESSIONS.get(sessionId);
    if (!session && !memSession) {
      throw new NotFoundException(`Session '${sessionId}' not found.`);
    }

    const currentSession = session || memSession;
    if (currentSession.evaluation) {
      return currentSession.evaluation;
    }

    const version = currentSession.caseVersion;
    const rubric = (version.scoringRubric as any) || {};
    const studentMsgs = (currentSession.messages || []).filter(
      (m: any) => m.role === 'STUDENT' || m.role === 'student',
    );
    const doctorText = studentMsgs.map((m) => m.content.toLowerCase()).join(' ');

    // -------------------------------------------------------------
    // Dimension 1: Interview Completeness & History Taking
    // -------------------------------------------------------------
    const hpiPillars = [
      { name: 'Onset & Timing', keys: ['when', 'start', 'how long', 'onset', 'time', 'duration'] },
      { name: 'Pain Quality & Description', keys: ['feel like', 'describe', 'sharp', 'crushing', 'tight', 'nature', 'heavy'] },
      { name: 'Radiation Pattern', keys: ['radiat', 'spread', 'jaw', 'arm', 'back', 'neck', 'shoulder'] },
      { name: 'Severity Scale (1-10)', keys: ['scale', 'rate', '1-10', '1 to 10', 'severity', 'how bad'] },
      { name: 'Associated Symptoms', keys: ['sweat', 'nausea', 'breath', 'vomit', 'dizzy', 'wheez', 'fever'] },
      { name: 'Past Medical History', keys: ['history', 'medical', 'condition', 'past', 'hospital', 'before'] },
      { name: 'Current Medications', keys: ['medicat', 'medicine', 'pill', 'inhaler', 'taking', 'prescript'] },
      { name: 'Allergies', keys: ['allerg'] },
      { name: 'Social History & Habits', keys: ['smoke', 'alcohol', 'drink', 'tobacco', 'cocaine', 'work'] },
      { name: 'Family History', keys: ['family', 'father', 'mother', 'heart attack', 'genetic'] },
    ];

    let dim1Score = 30;
    const dim1Hits: string[] = [];
    const dim1Misses: string[] = [];

    hpiPillars.forEach((p) => {
      if (p.keys.some((k) => doctorText.includes(k))) {
        dim1Score += 7;
        dim1Hits.push(p.name);
      } else {
        dim1Misses.push(p.name);
      }
    });
    dim1Score = Math.min(100, Math.max(35, dim1Score));

    // -------------------------------------------------------------
    // Dimension 2: Clinical Reasoning & Diagnostic Precision
    // -------------------------------------------------------------
    const events = currentSession.events || [];
    const dxEvent = events.find((e: any) => e.type === EventType.DIAGNOSIS_SUBMITTED);
    const isPrimaryCorrect = (dxEvent?.payload as any)?.isCorrectPrimary || false;
    const rationale = (dxEvent?.payload as any)?.rationale || '';

    let dim2Score = isPrimaryCorrect ? 65 : 35;
    const diffEvent = events.find((e: any) => e.type === EventType.DIFFERENTIAL_SUBMITTED);
    const diffCount = ((diffEvent?.payload as any)?.differentialIds || []).length;
    dim2Score += Math.min(20, diffCount * 10);

    if (rationale.length > 70) {
      dim2Score += 15;
    } else if (rationale.length > 20) {
      dim2Score += 8;
    }
    dim2Score = Math.min(100, Math.max(30, dim2Score));

    // -------------------------------------------------------------
    // Dimension 3: Bedside Communication & Empathy
    // -------------------------------------------------------------
    const empathyWords = ['sorry', 'help', 'comfort', 'take care', 'breathe', 'safe', 'worry', 'understand', 'ease'];
    const empathyCount = studentMsgs.filter((m: any) =>
      empathyWords.some((w) => m.content.toLowerCase().includes(w)),
    ).length;

    let dim3Score = 60;
    if (empathyCount >= 3) dim3Score = 96;
    else if (empathyCount >= 1) dim3Score = 84;

    // -------------------------------------------------------------
    // Dimension 4: Diagnostic Workup & Safety Efficiency
    // -------------------------------------------------------------
    const orderedEvents = events.filter((e: any) => e.type === EventType.INVESTIGATION_REQUEST);
    const allCaseInvs = (version.investigations as any[]) || [];
    const abnormalInvs = allCaseInvs.filter((i) => i.isAbnormal).map((i) => i.id);

    const orderedIds = orderedEvents.map((e: any) => (e.payload as any)?.testId || (e.payload as any)?.test);
    const orderedAbnormal = orderedIds.filter((id: any) => abnormalInvs.includes(id));

    let dim4Score = 50;
    if (abnormalInvs.length > 0) {
      dim4Score += Math.round((orderedAbnormal.length / abnormalInvs.length) * 45);
    }
    dim4Score = Math.min(100, Math.max(35, dim4Score));

    // -------------------------------------------------------------
    // Dimension 5: Guideline-Directed Management
    // -------------------------------------------------------------
    const mgmtEvent = events.find((e: any) => e.type === EventType.MANAGEMENT_SUBMITTED);
    const chosenMgmtIds = ((mgmtEvent?.payload as any)?.managementIds as string[]) || [];
    const caseProtocols = (version.managementProtocols as any[]) || [];

    const correctProtocols = caseProtocols.filter((m) => m.isCorrect).map((m) => m.id);
    const contraProtocols = caseProtocols.filter((m) => !m.isCorrect).map((m) => m.id);

    const chosenCorrect = chosenMgmtIds.filter((id) => correctProtocols.includes(id));
    const chosenContra = chosenMgmtIds.filter((id) => contraProtocols.includes(id));

    let dim5Score = 40;
    if (correctProtocols.length > 0) {
      dim5Score += Math.round((chosenCorrect.length / correctProtocols.length) * 50);
    }
    dim5Score -= chosenContra.length * 25;
    dim5Score = Math.min(100, Math.max(25, dim5Score));

    // -------------------------------------------------------------
    // Overall Weighted Score & Pass/Fail Status
    // -------------------------------------------------------------
    const overallScore = Math.round(
      dim1Score * 0.25 +
        dim2Score * 0.25 +
        dim3Score * 0.15 +
        dim4Score * 0.15 +
        dim5Score * 0.2,
    );

    const passStatus = overallScore >= 70 && chosenContra.length === 0;
    const overallGrade =
      overallScore >= 90
        ? 'High Honors'
        : overallScore >= 80
          ? 'Honors'
          : overallScore >= 70
            ? 'Pass'
            : 'Remediate';

    // Critical Actions Taken vs Missed
    const criticalActions = rubric.criticalActions || [];
    const criticalTaken: string[] = [];
    const criticalMissed: string[] = [];

    if (isPrimaryCorrect) {
      criticalTaken.push('Formulated accurate target primary diagnosis');
    } else {
      criticalMissed.push('Formulated accurate target primary diagnosis');
    }

    if (chosenCorrect.length >= 2) {
      criticalTaken.push('Initiated guideline-directed emergency pharmacotherapy');
    } else {
      criticalMissed.push('Prompt evidence-based pharmacologic stabilization');
    }

    if (criticalActions.length > 0) {
      criticalTaken.push(criticalActions[0]);
    }

    const strengths: string[] = [];
    if (dim1Score >= 75) strengths.push('Systematic OPQRST clinical history gathering');
    if (dim2Score >= 80) strengths.push('Accurate differential synthesis and diagnostic precision');
    if (dim3Score >= 80) strengths.push('Exemplary bedside empathy and reassuring presence');
    if (strengths.length === 0) strengths.push('Encounter completed within standardized target time');

    const areasForImprovement: string[] = [];
    if (dim1Misses.length > 0) areasForImprovement.push(`Inquire systematically regarding: ${dim1Misses.slice(0, 2).join(', ')}`);
    if (!isPrimaryCorrect) areasForImprovement.push('Re-correlate presenting complaint with objective diagnostic investigations');
    if (chosenContra.length > 0) areasForImprovement.push('Avoid contraindicated medications in emergent presentation');
    if (areasForImprovement.length === 0) areasForImprovement.push('Continue to refine door-to-treatment speed');

    const patientName = (version.patientProfile as any)?.name || 'Patient';
    const attendingSummary = `Dr. Attending Note: Encounter evaluation for ${patientName}. Candidate scored ${overallScore}% (${overallGrade}). ${isPrimaryCorrect ? 'Excellent diagnostic reasoning and timely guideline management.' : 'Diagnostic hypothesis was misaligned with the presentation. Review the clinical teaching points and retry.'}`;

    // Dimensions breakdown object
    const dimensionScores = {
      interviewCompleteness: {
        name: 'Interview Completeness',
        score: dim1Score,
        grade: dim1Score >= 80 ? 'Excellent' : dim1Score >= 70 ? 'Proficient' : 'Developing',
        feedback: `Elicited ${dim1Hits.length}/10 core clinical pillars.`,
        keyPoints: dim1Hits,
      },
      clinicalReasoning: {
        name: 'Clinical Reasoning',
        score: dim2Score,
        grade: dim2Score >= 80 ? 'Excellent' : dim2Score >= 70 ? 'Proficient' : 'Developing',
        feedback: isPrimaryCorrect ? 'Accurate primary diagnosis.' : 'Primary diagnosis misaligned.',
        keyPoints: [isPrimaryCorrect ? 'Target diagnosis identified' : 'Diagnostic misalignment'],
      },
      communication: {
        name: 'Communication & Empathy',
        score: dim3Score,
        grade: dim3Score >= 80 ? 'Excellent' : 'Proficient',
        feedback: `${empathyCount} empathetic phrases detected.`,
        keyPoints: [`${empathyCount} Bedside Reassurances`],
      },
      diagnosticWorkup: {
        name: 'Diagnostic Workup & Safety',
        score: dim4Score,
        grade: dim4Score >= 80 ? 'Excellent' : 'Proficient',
        feedback: `Uncovered ${orderedAbnormal.length} key abnormal diagnostic findings.`,
        keyPoints: orderedAbnormal,
      },
      management: {
        name: 'Guideline Management',
        score: dim5Score,
        grade: dim5Score >= 80 ? 'Excellent' : chosenContra.length > 0 ? 'Needs Practice' : 'Developing',
        feedback: `Initiated ${chosenCorrect.length} guideline therapies.${chosenContra.length > 0 ? ' Warning: Contraindicated therapy selected.' : ''}`,
        keyPoints: chosenCorrect,
      },
    };

    // Store evaluation in DB or in-memory
    let evaluation: any = null;

    if (session) {
      try {
        evaluation = await this.prisma.clinicalEvaluation.create({
          data: {
            sessionId,
            userId: session.userId,
            caseId: session.caseId,
            overallScore,
            passStatus,
            overallGrade,
            durationSeconds: session.durationSeconds || 600,
            dimensionScores,
            strengths,
            areasForImprovement,
            criticalActionsTaken: criticalTaken,
            criticalActionsMissed: criticalMissed,
            attendingSummary,
          },
        });

        // Close session
        await this.prisma.simulationSession.update({
          where: { id: sessionId },
          data: {
            status: SessionStatus.COMPLETED,
            currentStage: SessionStage.COMPLETED,
            endedAt: new Date(),
          },
        });

        // Record SESSION_COMPLETED interaction event
        await this.prisma.interactionEvent.create({
          data: {
            sessionId,
            type: EventType.SESSION_COMPLETED,
            name: 'EVALUATION_GENERATED',
            payload: { overallScore, passStatus, overallGrade },
          },
        });

        // Update Learner Weaknesses for remediation
        if (dim1Misses.length > 0) {
          await this.recordWeakness(session.userId, 'History Taking & Pertinent Negatives', session.caseId);
        }
        if (!isPrimaryCorrect) {
          await this.recordWeakness(session.userId, `${session.case?.specialty || 'General'} Diagnostic Differentiation`, session.caseId);
        }
        if (chosenContra.length > 0) {
          await this.recordWeakness(session.userId, 'Contraindicated Emergency Pharmacotherapy', session.caseId);
        }
      } catch {
        // Fallback
      }
    }

    if (!evaluation) {
      evaluation = {
        id: `eval-${Date.now()}`,
        sessionId,
        userId: currentSession.userId,
        caseId: currentSession.caseId,
        overallScore,
        passStatus,
        overallGrade,
        performanceBand: overallGrade,
        durationSeconds: currentSession.durationSeconds || 360,
        dimensionScores,
        strengths,
        weaknesses: areasForImprovement,
        areasForImprovement,
        criticalActionsTaken: criticalTaken,
        criticalActionsMissed: criticalMissed,
        attendingFeedback: attendingSummary,
        attendingSummary,
        createdAt: new Date().toISOString(),
      };
    }

    if (memSession) {
      memSession.evaluation = evaluation;
      memSession.status = SessionStatus.COMPLETED;
      memSession.currentStage = SessionStage.COMPLETED;
    }

    return evaluation;
  }

  async getEvaluation(evaluationId: string) {
    const evaluation = await this.prisma.clinicalEvaluation.findUnique({
      where: { id: evaluationId },
      include: {
        case: true,
        session: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation '${evaluationId}' not found.`);
    }

    return evaluation;
  }

  private async recordWeakness(userId: string, domain: string, caseId: string) {
    try {
      await this.prisma.learnerWeakness.upsert({
        where: {
          userId_domain: { userId, domain },
        },
        create: {
          userId,
          domain,
          frequency: 1,
          lastEncounterId: caseId,
          recommendedCaseIds: [caseId],
        },
        update: {
          frequency: { increment: 1 },
          lastEncounterId: caseId,
        },
      });
    } catch {
      // Non-critical logging for weakness upsert
    }
  }
}
