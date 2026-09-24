import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider, PatientPromptContext, LLMResponse } from '../interfaces/llm-provider.interface';

@Injectable()
export class MockLLMProvider implements LLMProvider {
  readonly name = 'mock';
  private readonly logger = new Logger(MockLLMProvider.name);

  async generatePatientResponse(context: PatientPromptContext): Promise<LLMResponse> {
    const q = context.userMessage.toLowerCase().trim();
    const facts = context.historyFacts || {};
    const patientName = context.patientName || 'Patient';

    this.logger.debug(`[MockLLM] Simulating patient turn for '${patientName}' on query: "${q}"`);

    // Greetings
    if (q.match(/^(hi|hello|hey|good morning|good afternoon|good evening|doctor)/i) && q.length < 40) {
      return {
        content: `Hello Doctor... Thank you for seeing me quickly. ${context.chiefComplaint || "I'm in a lot of discomfort."}`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Empathy acknowledgment
    if (
      (q.includes('sorry') || q.includes('comfort') || q.includes('help you') || q.includes('safe') || q.includes('take care')) &&
      q.length < 60 &&
      !q.includes('when') &&
      !q.includes('pain')
    ) {
      return {
        content: `Thank you, doctor. That genuinely means a lot to hear... I was getting very anxious sitting here.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // OPQRST: Onset / Timing
    if (q.includes('when') || q.includes('start') || q.includes('how long') || q.includes('onset') || q.includes('began') || q.includes('duration')) {
      return {
        content: `It ${facts.onset || 'started recently'} ${facts.timing || ''}`.trim(),
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // OPQRST: Provocation / Palliation
    if (q.includes('better') || q.includes('worse') || q.includes('aggravat') || q.includes('reliev') || q.includes('trigger') || q.includes('rest')) {
      return {
        content: `Well, ${facts.provocationPalliative || 'nothing has really made it better.'}`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // OPQRST: Quality / Character
    if (q.includes('feel like') || q.includes('describe') || q.includes('sharp') || q.includes('dull') || q.includes('crushing') || q.includes('tight') || q.includes('nature') || q.includes('type of pain')) {
      return {
        content: `It feels like ${facts.quality || 'an intense discomfort'}. It is definitely not a mild ache.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // OPQRST: Radiation / Spread
    if (q.includes('radiat') || q.includes('spread') || q.includes('move') || q.includes('jaw') || q.includes('arm') || q.includes('back') || q.includes('neck') || q.includes('shoulder') || q.includes('belly')) {
      if (facts.radiation) {
        return {
          content: `Yes, ${facts.radiation}`,
          provider: 'Mock / Deterministic Clinical Engine',
          model: 'interactmd-clinical-rules-v1',
        };
      }
      return {
        content: `No, it stays right where it is. It hasn't moved anywhere else.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // OPQRST: Severity (1-10)
    if (q.includes('scale') || q.includes('rate') || q.includes('how bad') || q.includes('severity') || q.includes('1 to 10') || q.includes('1-10') || q.includes('score')) {
      return {
        content: `Right now, ${facts.severity || 'it is an 8 out of 10'}. It is intensely uncomfortable.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Associated Symptoms: Sweating / Diaphoresis
    if (q.includes('sweat') || q.includes('clammy') || q.includes('perspir') || q.includes('cold sweat')) {
      const hasSweat = (facts.associatedSymptoms || []).some((s: string) => s.toLowerCase().includes('sweat') || s.toLowerCase().includes('diaphoresis'));
      return {
        content: hasSweat ? `Yes! I broke out in a cold sweat, my clothes are completely damp.` : `No unusual sweating, just feeling flushed and sick.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Associated Symptoms: Nausea / Vomiting
    if (q.includes('nausea') || q.includes('vomit') || q.includes('throw up') || q.includes('sick to your stomach') || q.includes('appetite')) {
      const nauseaItem = (facts.associatedSymptoms || []).find((s: string) => s.toLowerCase().includes('nausea') || s.toLowerCase().includes('vomit') || s.toLowerCase().includes('anorexia') || s.toLowerCase().includes('appetite'));
      return {
        content: nauseaItem ? `Yes, ${nauseaItem}.` : `No nausea or vomiting, my stomach feels normal.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Breathing / Shortness of Breath
    if (q.includes('breath') || q.includes('short of breath') || q.includes('wheez') || q.includes('air')) {
      const sob = (facts.associatedSymptoms || []).find((s: string) => s.toLowerCase().includes('breath') || s.toLowerCase().includes('wheez'));
      if (sob) {
        return {
          content: `Yes, ${sob}.`,
          provider: 'Mock / Deterministic Clinical Engine',
          model: 'interactmd-clinical-rules-v1',
        };
      }
      return {
        content: `Breathing is okay, it's mostly the pain that is bothering me.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Cough / Sputum
    if (q.includes('cough') || q.includes('phlegm') || q.includes('sputum') || q.includes('mucus')) {
      const coughItem = (facts.associatedSymptoms || []).find((s: string) => s.toLowerCase().includes('cough') || s.toLowerCase().includes('sputum'));
      return {
        content: coughItem ? `Yes, ${coughItem}.` : `No cough at all, doctor.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Past Medical History
    if (q.includes('past medical') || q.includes('medical history') || q.includes('conditions') || q.includes('chronic') || q.includes('hospital')) {
      const pmh = facts.pastMedicalHistory || [];
      return {
        content: pmh.length > 0 ? `In terms of past medical history: ${pmh.join(', ')}.` : `I haven't had any major chronic medical conditions before this.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Current Medications
    if (q.includes('medicat') || q.includes('medicine') || q.includes('pill') || q.includes('inhaler') || q.includes('prescript') || q.includes('taking')) {
      const meds = facts.medications || [];
      return {
        content: meds.length > 0 ? `I take: ${meds.join(', ')}.` : `I do not take any regular prescription medications daily.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Allergies
    if (q.includes('allerg')) {
      const allergies = facts.allergies || [];
      return {
        content: allergies.length > 0 ? `Regarding allergies: ${allergies.join(', ')}.` : `No known allergies to medications that I know of.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Social History
    if (q.includes('smoke') || q.includes('alcohol') || q.includes('drink') || q.includes('drug') || q.includes('work') || q.includes('lifestyle')) {
      const social = facts.socialHistory || [];
      return {
        content: social.length > 0 ? `${social.join(' ')}` : `I don't smoke and drink only occasionally.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Family History
    if (q.includes('family') || q.includes('father') || q.includes('mother') || q.includes('parents') || q.includes('runs in the family')) {
      const fh = facts.familyHistory || [];
      return {
        content: fh.length > 0 ? `In my family: ${fh.join(', ')}` : `No significant medical conditions run in my immediate family that I am aware of.`,
        provider: 'Mock / Deterministic Clinical Engine',
        model: 'interactmd-clinical-rules-v1',
      };
    }

    // Default contextual answer
    return {
      content: `I'm trying to focus, Doctor... It's mostly that ${facts.quality ? facts.quality.toLowerCase() : 'pain'}, and ${facts.provocationPalliative ? facts.provocationPalliative.toLowerCase() : 'it hurts'}. What else do you need to know?`,
      provider: 'Mock / Deterministic Clinical Engine',
      model: 'interactmd-clinical-rules-v1',
    };
  }
}
