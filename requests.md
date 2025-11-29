**Reliability Engineering**
===========================

**Site Reliability Engineering (Team-Based)**
---------------------------------------------

**Deliverable:** PDF (6–12 pages), screenshots required.

**Grading:** Achieving (A) / Exceeding (E) / Outstanding (O).

**Teamwork:** Same team structure as previous assignments; each member submits from their role perspective.

* * *

**Task 1 — Observability: Logs & Metrics (Achieving)**
------------------------------------------------------

Students must:

* Ensure application and environment generate **logs**, **metrics**, and optionally **traces**.

* Integrate any collection method:
  
  * Console-based viewer (e.g., kubectl logs, docker logs, custom CLI).
  
  * GUI-based dashboard (e.g., Grafana, Kibana, Prometheus UI, Elastic APM, custom dashboard).

* Provide screenshots showing:
  
  * Log entries
  
  * Metrics (CPU, memory, latency, request rate, errors, etc.)

* Explain how their setup supports reliability.

* * *

**Task 2 — SLI/SLO/SLA + Runbooks (Exceeding)**
-----------------------------------------------

Students must produce:

* **SLIs** (e.g., request latency, error rate, availability).

* **SLOs** (e.g., 99.5% monthly availability, <200ms median latency).

* **SLAs** (a realistic statement outlining commitments to users).

* **Runbooks** describing step-by-step operational recovery procedures, including:
  
  * Detecting an incident
  
  * Identifying root cause
  
  * Executing recovery commands
  
  * Validating service health
  
  * Escalation path and communication
    
    

Screenshots of runbook templates or workflow diagrams are encouraged.

* * *

**Task 3 — Chaos Engineering & Continuous Improvement (Outstanding)**
---------------------------------------------------------------------

Students must present a plan (demo optional) for:

* Injecting controlled failures (e.g., killing services, introducing latency, dropping packets).

* Measuring the system’s response and validating SLOs.

* Improving reliability through:
  
  * Auto-healing
  
  * Load balancing adjustments
  
  * Error budget policies
  
  * Better alerting and dashboards

* Reflection section: What broke? What improved? What remains risky?

* * *

**Role-Based Deliverables**
===========================

**1. Project Manager (PM)**
---------------------------

Focus on reliability goals, coordination, and documentation.

* Define the team’s **SLO/SLI/SLA** and justify why they matter for the chosen system.

* Produce a **service reliability overview**: key components, risks, dependencies.

* Write the **runbook index**: what runbooks exist, when to use them, escalation paths.

* Provide the **timeline and workflow diagram** showing observability setup → alerting → recovery → post-incident review.

* Summarize reliability risks and propose a **continuous improvement plan** (capacity planning, alert tuning, tech debt items).

**2. Developer**
----------------

Focus on instrumentation, logging, and recoverability.

* Implement **application logging** (structured logs preferred) with clear severity levels.

* Add **metric emission** (e.g., Prometheus counters/gauges/histograms, or custom metrics).

* Build a **simple dashboard** or terminal-based viewer to display logs/metrics.

* Include configuration for **alerts or thresholds** (even simulated).

* Document the code-level choices: log format, correlation IDs, error-handling strategy.

**3. Tester**
-------------

Focus on validation and degradation scenarios.

* Create **test cases** for reliability features:
  
  * Log generation under normal and error conditions
  
  * Metric correctness
  
  * Alert thresholds triggering appropriately

* Conduct **incident simulation tests** (manual or scripted): service crash, timeout, high latency, dependency failure.

* Validate each runbook: confirm steps are reproducible and complete.

* Provide **evidence screenshots** demonstrating failures and recovery steps.

* Recommend improvements to reduce false positives and blind spots.

**4. Designer**
---------------

Focus on clarity, observability UX, and reliability documentation.

* Design the **dashboard layout** (information hierarchy, grouping of KPIs).

* Provide **visual design** for runbooks: icons, flowcharts, color coding for steps/severity.

* Create a **service map diagram** showing components, traffic flow, and failure points.

* Define **error budget visualization** (simple graph, gauge, or timeline).

* Ensure the final PDF uses consistent visual language for reliability, alerts, and incidents.

* * *

**Team-Based Grading Guidance**
===============================

### **A — Achieving**

* Logs and metrics are functional and visible.

* Basic dashboard (CLI/GUI) with screenshots.

* SLIs and SLOs partially defined but usable.

* A simple runbook created with clear steps.

* Each member submits a role-specific explanation.

### **E — Exceeding**

* Logs + metrics are well-organized and meaningful.

* Dashboard includes multiple metrics with interpretation.

* SLI/SLO/SLA are coherent and aligned with system behavior.

* Runbooks cover several failure types with clear procedures.

* Team collaboration is evident: consistent terminology, linked tasks.

* Each member’s deliverable reflects the depth of their role.

### **O — Outstanding**

* Clear observability strategy with insightful metrics.

* Demonstration or detailed plan of chaos engineering.

* Evidence-based discussion of SLO tuning using collected data.

* Runbooks tested through load/failure simulation.

* Creative, practical reliability improvements proposed.

* All role-based submissions show strong ownership and technical clarity.
