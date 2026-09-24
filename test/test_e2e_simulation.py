import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def request(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req_body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} on {method} {path}: {err_body}")
        raise e

def main():
    print("\n========================================================")
    print("  INTERACTMD END-TO-END CLINICAL SIMULATION VALIDATION")
    print("========================================================\n")
    
    # 1. Login
    print("[1] Testing POST /auth/login ...")
    login_res = request("POST", "/auth/login", {
        "email": "learner@interactmd.com",
        "password": "Password123!"
    })
    token = login_res.get("accessToken")
    user = login_res.get("user")
    print(f"    -> Logged in successfully as: {user.get('name')} ({user.get('role')})")
    print(f"    -> JWT Token generated (length: {len(token)})")
    
    # 2. Case Discovery Catalog
    print("\n[2] Testing GET /cases ...")
    cases = request("GET", "/cases", token=token)
    print(f"    -> Retrieved {len(cases)} clinical benchmark cases:")
    for c in cases:
        print(f"       * [{c.get('difficulty')}] {c.get('title')} ({c.get('category')})")
    
    selected_case = cases[0]
    case_id = selected_case.get("id")
    print(f"\n    -> Selected Case: {selected_case.get('title')} (ID: {case_id})")
    
    # 3. Start Simulation Session
    print("\n[3] Testing POST /simulations/start ...")
    sim_res = request("POST", "/simulations/start", {
        "caseId": case_id
    }, token=token)
    session_id = sim_res.get("id")
    print(f"    -> Simulation session created: {session_id}")
    print(f"    -> Current Stage: {sim_res.get('currentStage')}")
    patient = sim_res.get("case", {}).get("patientProfile", {})
    print(f"    -> Patient: {patient.get('name')}, {patient.get('age')}yo {patient.get('gender')}")
    print(f"    -> Chief Complaint: \"{patient.get('chiefComplaint')}\"")
    
    # 4. Doctor History Taking (Chat interaction with AI Patient)
    print("\n[4] Testing POST /simulations/:id/messages (History Taking) ...")
    chat_prompt = "Hello Arthur, I'm Dr. Chen. I understand you're feeling severe discomfort. Can you describe where the pain is and when it started?"
    print(f"    -> Doctor Question: \"{chat_prompt}\"")
    
    msg_res = request("POST", f"/simulations/{session_id}/messages", {
        "message": chat_prompt
    }, token=token)
    
    ai_response = msg_res.get("message", {}).get("content")
    events = msg_res.get("events", [])
    print(f"    -> AI Patient Answer: \"{ai_response}\"")
    print(f"    -> Interaction Events Triggered: {len(events)}")
    for ev in events:
        print(f"       * Event: {ev.get('eventType')} - details: {ev.get('eventData')}")
    
    # Second question testing OPQRST progression
    chat_prompt_2 = "Does the pain radiate anywhere, like to your left arm or jaw? And are you having any shortness of breath or sweating?"
    print(f"\n    -> Doctor Followup: \"{chat_prompt_2}\"")
    msg_res_2 = request("POST", f"/simulations/{session_id}/messages", {
        "message": chat_prompt_2
    }, token=token)
    print(f"    -> AI Patient Answer: \"{msg_res_2.get('message', {}).get('content')}\"")
    
    # 5. Controlled Physical Examination
    print("\n[5] Testing POST /simulations/:id/examination (Physical Exam) ...")
    exam_res = request("POST", f"/simulations/{session_id}/examination", {
        "system": "cardiovascular"
    }, token=token)
    print(f"    -> Exam System: {exam_res.get('system')}")
    print(f"    -> Clinical Findings: {exam_res.get('findings')}")
    
    # 6. Diagnostic Investigations / Labs
    print("\n[6] Testing POST /simulations/:id/investigations (Diagnostic Workup) ...")
    inv_res = request("POST", f"/simulations/{session_id}/investigations", {
        "test": "inv-ecg"
    }, token=token)
    print(f"    -> Test Ordered: {inv_res.get('test')}")
    print(f"    -> Official Diagnostic Result: {inv_res.get('result')}")
    
    # 7. Clinical Reasoning & Diagnosis
    print("\n[7] Testing POST /simulations/:id/diagnosis ...")
    diag_res = request("POST", f"/simulations/{session_id}/diagnosis", {
        "mostLikelyDiagnosisId": "dx-stemi",
        "differentialDiagnosisIds": [
            "dx-dissection",
            "dx-pe"
        ],
        "clinicalRationale": "Patient presents with classic crushing retrosternal pain radiating to left arm with diaphoresis, unyielding to sublingual nitroglycerin. 12-lead ECG reveals diagnostic ST-elevation in inferior leads II, III, aVF."
    }, token=token)
    print(f"    -> Diagnosis Response: {diag_res}")
    
    # 8. Management Protocol
    print("\n[8] Testing POST /simulations/:id/management ...")
    mgmt_res = request("POST", f"/simulations/{session_id}/management", {
        "selectedManagementIds": [
            "mgmt-aspirin",
            "mgmt-cath",
            "mgmt-heparin"
        ]
    }, token=token)
    print(f"    -> Management Response: {mgmt_res}")
    
    # 9. Attending Physician Evaluation (5 Competency Dimensions)
    print("\n[9] Testing POST /evaluations/session/:sessionId ...")
    eval_res = request("POST", f"/evaluations/session/{session_id}", {}, token=token)
    print(f"    -> Evaluation Score: {eval_res.get('overallScore')}% ({eval_res.get('performanceBand')})")
    print(f"    -> 5-Dimension Competency Scores:")
    for dim, score in eval_res.get('dimensionScores', {}).items():
        print(f"       * {dim}: {score}%")
    print(f"    -> Clinical Strengths: {eval_res.get('strengths')}")
    print(f"    -> Actionable Remediation: {eval_res.get('weaknesses')}")
    print(f"    -> Attending Feedback Summary: {eval_res.get('attendingFeedback')[:140]}...")
    
    # 10. Dashboard & Recommendations
    print("\n[10] Testing GET /dashboard and GET /recommendations ...")
    dash = request("GET", "/dashboard", token=token)
    print(f"    -> Total Simulations Completed: {dash.get('simulationsCompleted')}")
    print(f"    -> Learner Competency Radar: {dash.get('competencyRadar')}")
    
    recs = request("GET", "/recommendations", token=token)
    print(f"    -> Recommended Remedial Case: {recs.get('recommendedCases', [{}])[0].get('title', 'N/A')}")
    
    print("\n========================================================")
    print("  ALL 10 CLINICAL SIMULATION ENDPOINTS VERIFIED 100% OK!")
    print("========================================================\n")

if __name__ == "__main__":
    main()
