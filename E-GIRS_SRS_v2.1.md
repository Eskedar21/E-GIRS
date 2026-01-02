
Software Requirements Specification
-
National e-Government Index Reporting System (E-GIRS) 
-
Submitted to
Ministry of Innovation and Technology
  

Document Version 2.0

Nov 5, 2025 

Prepared By
 

360Ground™ ELDIX IT Technology PLC
 

Revision History:
Version	Author(s)	Date	Summary of Changes
1.0	Eskedar
eskedar@360ground.com
Oct 15, 2025	Initial Draft
2.0	Eskedar
eskedar@360ground.com
Nov 5, 2025	Incorporated comprehensive client feedback from the initial draft.
•	Enhanced the assessment framework to be fully dynamic and year-based.
•	Refined the data collection and validation workflow to include new user roles and a more robust approval process.
•	Expanded reporting and visualization capabilities to align with international standards.
•	Added system diagrams (Use Case, DFD, Context) for improved clarity.
 
Table of Contents
1.	Introduction	6
1.1.	Purpose of this Document	7
1.2.	Scope of the Product	7
1.3.	Definitions, Acronyms, and Abbreviations	8
1.3.1.	Project-Specific Terms & Acronyms	8
1.3.2.	Administrative Hierarchy	8
1.3.3.	General Technical & Project Management Acronyms	8
1.4.	Document Overview	9
2.	Overall Description	10
2.1.	Product Perspective	10
2.2.	Product Features	11
2.2.1.	Core Features	11
2.3.	User Role and Permission Matrix	12
2.4.	Use Case Diagram	14
2.4.1.	Diagram 1: System Configuration & Management	15
2.4.2.	Diagram 2: Core Assessment Workflow	16
2.4.3.	Diagram 3: Reporting & Analytics	17
2.5.	System Context Diagram	18
2.5.1.	Purpose	18
2.5.2.	Diagram	18
2.5.3.	Component Breakdown	19
2.6.	2.6. High-Level Data Flow Diagram (DFD)	20
2.6.1.	Purpose	20
2.6.2.	Diagram	20
2.6.3.	Component Breakdown	21
2.7.	Assumptions and Dependencies	23
2.8.	Constraints	23
3.	Functional Requirements	25
3.1.	System Administration & User Management	25
3.1.1.	Administrative Unit Management	25
3.1.2.	User Authentication and Access Control	27
3.1.3.	Role-Based Dashboard	28
3.1.4.	Workflow Notifications	29
3.2.	Indicator & Methodology Management	30
3.2.1.	Assessment Framework Management	30
3.2.2.	Indicator Definition	31
3.3.	Data Collection & Validation Workflow	33
3.3.1.	Data Submission	33
3.3.2.	Initial Approval	33
3.3.3.	Central Validation	34
3.4.	Core Calculation & Scoring Engine	36
3.4.1.	Subjective Scoring by Central Committee	36
3.4.2.	Nnormalization	36
3.4.3.	Indicator Scoring	37
3.4.4.	Dimension Calculation	37
3.4.5.	Unit Score and Hierarchical Aggregation	37
4.	Calculation Engine Logic and Example	39
4.1.	Purpose	39
4.2.	Scenario Setup	39
4.2.1.	Assessment Framework Configuration	39
4.2.2.	Submitted and Scored Data	39
4.3.	A.3 Step-by-Step Calculation for Oromia Region	40
5.	Reporting & Visualization	42
5.1.	Report 1: National E-Government Performance Dashboard	42
5.2.	Report 2: Unit Scorecard	43
5.3.	Internal Reports for Federal Institutes	45
5.3.1.	Report 1: Federal Institute Submissions Overview	45
5.3.2.	Report 2: Federal Institute Detailed Submission View	46
6.	Non-Functional Requirements	47
7.	Other Requirements	49
7.1.	System Deliverables	49
7.2.	Warranty and Support Services	50
7.3.	Knowledge Transfer and Training Program	51
7.4.	Deployment	51
Approvals and Authorizations	52

Table of Tables
Table 1 Key Features and High-Level Descriptions	11
Table 2 User Role and Permission Matrix	12
Table 3 Assumptions and Dependencies	23
Table 4  Consolidated Non-Functional Requirements	47

Table of Figures
Figure 1: System Configuration & Management	15
Figure 2: Core Assessment Workflow	16
Figure 3: Reporting & Analytics	17
Figure 4: System Context Diagram	18
Figure 5: High-Level Data Flow Diagram (DFD)	20
 
1.	Introduction
In an era marked by rapid advancements in technology, electronic government (e-government) has emerged as a critical component of modern governance. As governments worldwide embrace digital initiatives, the need for comprehensive and systematic assessment becomes evident. The United Nations E-Government Development Index (EGDI), a survey of all 193 Member States, serves as the primary international benchmark for measuring a nation's progress in leveraging technology to enhance service delivery, reduce costs, and increase citizen participation.
The Government of Ethiopia, through the Ministry of Innovation and Technology (MInT), is mandated to lead, coordinate, and monitor all national ICT activities. In alignment with the Digital Ethiopia 2025 strategy, MInT is driving the nation's shift from traditional, paper-based systems to dynamic digital platforms. As significant investments are made in these e-government initiatives, there is a growing need to assess the effectiveness and impact of these digital transformations.
To address this, the Ministry has planned the Development and Implementation of a National e-Government Index Reporting System (E-GIRS) with a Business Intelligence (BI) enabled Dashboard. This system is a comprehensive digital platform designed to evaluate and report on the performance of e-government initiatives across various Federal, Regional, and City Administrations. It aims to provide a standardized framework for assessing the effectiveness and efficiency of electronic government services and their impact on citizens and government organizations.
Benchmarking plays an essential role in this transformation. By assessing Ethiopia's e-government initiatives against national and international standards, the E-GIRS facilitates informed decision-making. It provides a comprehensive view of strengths and weaknesses, enabling government bodies to allocate resources efficiently, prioritize initiatives, and foster a culture of continuous improvement. By providing data-driven insights, the reporting system will serve as a compass for policymakers, guiding them toward the most effective strategies for digital governance.
The implementation of the E-GIRS offers significant benefits for all stakeholders. For the government, it provides a platform to openly report performance data, driving healthy competition and knowledge sharing between administrative units. For citizens, it promotes accountability and transparency, allowing them to assess the government's commitment to providing efficient and accessible digital services, which in turn enhances trust. For researchers and academic institutions, E-GIRS data can be used to conduct further studies on e-government trends and best practices, contributing to the advancement of knowledge in the field.
The purpose of this Software Requirements Specification (SRS) document is to provide a clear and comprehensive outline of the objectives, scope, functional and non-functional requirements, architectural design models, and overall expectations for the development and implementation of the E-GIRS platform. As Ethiopia advances its Digital Ethiopia 2025 strategy, this system has become vital for measuring and reporting on the effectiveness of e-government initiatives at a national level.

1.1.	Purpose of this Document
This Software Requirements Specification (SRS) document outlines the functional and non-functional requirements for the National e-Government Index Reporting System (E-GIRS) and its associated BI enabled Dashboard. The E-GIRS is a strategic initiative by the Ministry of Innovation and Technology (MInT) of Ethiopia, aimed at establishing a comprehensive system for assessing, monitoring, and reporting on the e-government performance of various administrative units within Ethiopia.
The purpose of this SRS is to provide a clear, concise, and unambiguous description of the system's capabilities, interfaces, performance characteristics, and constraints. It will serve as the primary reference document for the design, development, testing, and validation of the E-GIRS platform. This document is intended for use by all project stakeholders, including MInT representatives, the development team, quality assurance personnel, and project managers, to ensure a shared understanding of the system to be delivered.
1.2.	Scope of the Product
The scope of the E-GIRS assignment covers the complete project lifecycle—from requirements specification and design to the development and deployment—of a standardized and scalable National e-Government Index Reporting System.
The resulting web-based platform will provide the following core capabilities:
•	Facilitate Dynamic Data Collection: Provide a secure, role-based online mechanism for designated administrative units (including Federal, Regional, and Woreda levels) to submit data pertinent to the indicators defined for a specific assessment year.
•	Incorporate a Multi-Stage Validation Workflow: Implement a structured workflow for the review, validation, and potential rejection of submitted data by Initial Approvers and a Central Committee to ensure accuracy and consistency.
•	Automate Scoring and Hierarchical Aggregation: Automatically calculate index scores for individual indicators, dimensions, and administrative units based on the validated data and the configured weighting formula. The system will correctly aggregate scores up the administrative hierarchy.
•	Provide Interactive Reporting and Visualization: Offer a dynamic, BI-enabled public dashboard with interactive visualizations (charts, maps, and rankings) for analyzing trends and comparing performance. It will also provide secure, detailed internal reports for authenticated users.
This scope is focused on delivering a system that not only meets the immediate functional needs but is also built on a standard, scalable architecture to support future growth and evolution of the e-government assessment framework.

1.3.	Definitions, Acronyms, and Abbreviations
1.3.1.	Project-Specific Terms & Acronyms
Term	Definition
Category	One of the three main thematic groupings (Infrastructure Readiness, Online Service Provision, Human Capacity) used in the final stages of Woreda score calculation. Category scores are derived from the weighted average of their mapped Dimension Scores.
Core Dimension	One of the six primary pillars of the assessment framework (e.g., Institutional Framework, Content Provision). Each Dimension is a collection of related indicators.
Data Contributor	A user role assigned to personnel at the Woreda level, responsible for inputting assessment data and evidence for their specific administrative unit.
E-GIRS	National e-Government Index Reporting System. The official name of the software platform being specified.
FinalIndicatorScore	A single, normalized (0-1) score calculated for each of the 86 Parent Indicators, based on the weighted sum of its sub-question scores.
Indicator	A specific metric or question within a Core Dimension used to assess e-government performance. Can be a Parent Indicator with multiple Sub-Questions.
Maturity Level	A qualitative band (Low, Medium, High, Very High) assigned to an administrative unit based on its calculated E-GIRS score.
Normalization	The process of converting raw scores from different scales (e.g., a 1-5 rating) into a common 0-1 scale to ensure mathematical consistency in weighted calculations.
Parent Indicator	A top-level assessment question that acts as a container for one or more detailed Sub-Questions. It has a total weight that is distributed among its Sub-Questions.
Regional Approver	A user role responsible for reviewing, approving, or sending back data submissions from Woredas within their specific Region or City Administration.
Sub-Question	A detailed, individual question that makes up a Parent Indicator. Each Sub-Question has its own response type (e.g., Yes/No, Text) and a weight relative to its parent.
Woreda Score	The foundational composite index score calculated for a single Woreda, based on its performance across all categories and dimensions. This score is the basis for all higher-level aggregations.
1.3.2.	Administrative Hierarchy
Term	Definition
Region / City Admin	The highest level of the administrative hierarchy for which a final E-GIRS index score is produced.
Zone / Sub-city	The second-tier administrative unit, which is a child of a Region or City Administration. Its score is calculated by averaging the scores of its child Woredas.
Woreda	The lowest-level administrative unit in the E-GIRS hierarchy. This is the level where all initial data is collected and scored.
1.3.3.	General Technical & Project Management Acronyms
Term	Definition
BI	Business Intelligence. Refers to the technologies and processes for data analysis and visualization to generate actionable insights.
EGDI	E-Government Development Index. A composite index published by the United Nations to measure the e-government readiness of member states.
KPI	Key Performance Indicator. A quantifiable measure used to evaluate the success of an organization or activity.
NFR	Non-Functional Requirement. Defines system attributes such as performance, security, and usability.
RBAC	Role-Based Access Control. A security model that restricts system access based on a user's assigned role.
SRS	Software Requirements Specification. This document.
UAT	User Acceptance Testing. The final phase of testing where the client validates that the system meets their requirements.
UI	User Interface. The graphical layout and visual elements of the application.
UX	User Experience. The overall experience a user has when interacting with the application.
WCAG	Web Content Accessibility Guidelines. International standards for making web content more accessible to people with disabilities.

1.4.	Document Overview
This Software Requirements Specification (SRS) document is structured to provide a comprehensive understanding of the E-GIRS project. The document is organized as follows:
•	Section 1: Introduction: This section outlines the purpose and scope of the E-GIRS project and this SRS document. It also includes definitions of key terms, acronyms, and abbreviations used throughout the document, lists relevant reference materials, and provides this overview of the document's structure.
•	Section 2: Overall Description: This section provides a high-level perspective of the E-GIRS system. It describes the product in relation to other systems (Product Perspective), summarizes its core functionalities (Product Functions), identifies the different types of users and their characteristics (User Characteristics), and outlines any general constraints, assumptions, and dependencies that affect the project.
•	Section 3: Functional Requirements: define system capabilities by module—such as User Management, Data Input, Index Calculation, and BI Dashboards—framed as user stories with clear acceptance criteria.
•	Section 4: NFRs detail performance expectations and operational constraints, including security, reliability, usability, scalability, maintainability, localization, data integrity, and compliance with legal and regulatory standards
•	Section 5: Other Requirements: This section captures any requirements that do not fit neatly into the previous categories but are essential for the successful delivery and operation of the E-GIRS. This includes requirements related to specific Training needs for different user groups, comprehensive System and User Documentation, Installation and Deployment procedures, and ongoing Support and Maintenance considerations.
 
2.	Overall Description
This section provides a high-level overview of the National eGov Index Reporting System (E-GIRS) and BI-enabled Dashboard. The E-GIRS is designed to be a comprehensive digital platform for assessing, monitoring, and reporting on the performance of Ethiopia's electronic government (e-government) initiatives and services across various Federal, Regional, and City Administrations.
The primary aim of the E-GIRS is to establish a standardized framework and a centralized system for evaluating the effectiveness and efficiency of e-government services and their impact on citizens and government organizations. It will facilitate data-driven decision-making, promote transparency and accountability, identify areas for improvement, and ultimately contribute to enhancing Ethiopia's e-government development, aiming to improve its ranking on global indices such as the UN E-Government Development Index (EGDI).
The E-GIRS will support the collection of data based on predefined dimensions, sub-dimensions, and Key Performance Indicators (KPIs), closely aligned with international best practices and the UN EGDI methodology. It will feature a BI-enabled dashboard for visualizing trends, comparing performance, and providing actionable insights to policymakers, government officials, researchers, and the public.
2.1.	Product Perspective
The E-GIRS platform is a strategic initiative under the purview of the Ministry of Innovation and Technology (MInT), aligning with Ethiopia's broader digital transformation goals and the Digital Ethiopia 2025 strategy. It is envisioned as a critical tool for:
•	Benchmarking: Allowing Ethiopian government administrative units to benchmark their e-government initiatives against national standards, international best practices, and peer entities.
•	Monitoring & Evaluation: Providing a systematic way to track the progress and impact of e-government projects and services over time.
•	Policy Formulation: Offering evidence-based insights to inform policy development and strategic decision-making in the domain of digital governance.
•	Transparency & Accountability: Enabling open reporting of e-government performance data, fostering trust and allowing citizens to assess the government's commitment to digital service delivery.
•	Continuous Improvement: Identifying strengths, weaknesses, and opportunities for improvement in e-government implementation across different levels of government.
The E-GIRS is intended to be a data-rich web portal, deployed at the national datacenter.
As part of a broader ecosystem aimed at enhancing digital governance, the E-GIRS platform ensures:
1.	Scalability: Designed to accommodate an increasing volume of data and user load as more government entities and services are included in the assessment.
2.	Security & Privacy: Adherence to national data protection regulations and security best practices to protect sensitive government and potentially citizen-related information.
3.	Usability: An intuitive and user-friendly interface for different user groups, including MInT administrators, data providers from government entities, and public users accessing the dashboard.
4.	Sustainability: Built with considerations for long-term maintenance, adaptability to evolving technologies, and government practices.
2.2.	Product Features
The E-GIRS is designed to provide a robust set of features to support the entire lifecycle of e-government index reporting, from framework definition and data collection to analysis and dissemination. Key functionalities are integrated to ensure data accuracy, consistency, security, and ease of use.
2.2.1.	Core Features
Table 1 Key Features and High-Level Descriptions
Key Feature	High-Level Description
Assessment Framework Management	Allows MInT administrators to define and manage assessment dimensions, sub-dimensions, Key Performance Indicators (KPIs), and weighting criteria, aligned with UN EGDI and national priorities.
User and Organization Management	Provides secure registration and management of user accounts (Administrators, Data Providers, Reviewers) and participating government organizations (Regional, City Administrations), including role-based access control (RBAC).
Data Collection & Submission	Enables authorized Data Providers to input e-government performance data and upload supporting evidence through structured online forms/questionnaires, specific to the active assessment period and their organization.
Index Calculation Engine	Automatically calculates e-government index scores for regions, City Administrations, and the nation as a whole, based on the submitted data and the predefined assessment framework and weighting.
BI-enabled Dashboard & Reporting	Provides interactive dashboards with data visualizations (charts, graphs, maps) for MInT officials, stakeholders, and the public to view trends, compare performance, and generate customizable reports.
Security and Access Control	Enforces secure access policies through authentication, authorization, data encryption, and audit logging to protect sensitive information and ensure compliance with privacy regulations.
Multilingual Support	Supports local languages (e.g., English, Amharic, Oromifa) to cater to a diverse user base within Ethiopia.
System Administration & Configuration	Provides tools for MInT administrators to manage system settings.
 

2.3.	User Role and Permission Matrix
Permission Legend:
•	Full: Full Create, Read, Update & Delete permissions.
•	C: Create
•	R: Read / View
•	U: Update / Edit
•	D: Delete
•	(S): Scoped Access — Permission is limited to the user's assigned administrative unit (e.g., a Data Contributor can only access their own Woreda; a Regional Approver can only access Woredas within their Region).
•	N/A: Not Applicable / No Access.
Table 2 User Role and Permission Matrix

Module	Specific Permission / Feature	Super Admin	MInT Admin	Regional Admin	Institute Admin	Chairman (CC)	Central Committee Member	Secretary (CC)	Initial Approver	Data Contributor	Public User
System & User Access	Login / Logout / Change Own Password	Yes	Yes	Yes	Yes	Yes	Yes	Yes	Yes	Yes	N/A
	User Management (Scoped)	Full	Full	C/R/U (S)	C/R/U (S)	C/R/U (S)	N/A	N/A	N/A	N/A	N/A
Framework & Configuration	Administrative Unit Management	Full	Full	R	R	R	R	R	R	R	N/A
	Assessment Framework Management	R	Full	R	R	R	R	R	R	R	N/A
Data Collection & Validation Workflow	Submit Data for Assigned Unit	R	R	R	R	R	R	R	R (S)	C/R/U (S)	N/A
	Perform Initial Approval	N/A	R	N/A	N/A	R	R	R	U (S)	N/A	N/A
	Perform Central Validation (Approve/Reject)	N/A	R	N/A	N/A	R	U	R	N/A	N/A	N/A
	Perform Subjective Scoring	N/A	R	N/A	N/A	R	C/U	R	N/A	N/A	N/A
Reporting & Analytics	View Public Dashboards & Reports	R	R	R	R	R	R	R	R	R	R
	View Detailed Unit Submissions	R	R	R (S)	R (S)	R	R	R	R (S)	R (S)	N/A
	View Validated Submissions & Notes	N/A	R	R (S)	R (S)	R	R	R	R (S)	N/A	N/A
	Generate Comprehensive National Reports	R	C/R	N/A	N/A	C/R	R	C/R	N/A	N/A	N/A
	View Federal Institute Overview Report	R	R	N/A	R (S)	R	R	R	R (S)	R (S)	N/A
	View Federal Institute Detailed Report	R	R	N/A	R (S)	R	R	R	R (S)	R (S)	N/A
2.4.	Use Case Diagram
To enhance clarity and visibility, the system's functionalities are represented in three separate use case diagrams, each focusing on a core functional area. The diagrams use standard UML notation.
 
2.4.1.	Diagram 1: System Configuration & Management
This diagram illustrates the use cases related to the setup and administration of the E-GIRS platform. It shows a clear separation of duties, with the MInT Administrator having full control and other administrative roles having delegated, scoped permissions.
Figure 1: System Configuration & Management
   
Visual Diagram:(This diagram shows the MInT Administrator connected to all three management use cases. A generic "Delegated Administrator" is connected only to "Manage Users & Roles." The Regional Admin, Institute Admin, and Chairman are shown to be specializations (inheritance) of the Delegated Administrator.)
2.4.2.	Diagram 2: Core Assessment Workflow
This diagram visualizes the primary business process of data collection, approval, and validation, showing the sequential flow of tasks from one actor to the next.
Figure 2: Core Assessment Workflow
 
Visual Diagram:(This diagram shows a clear top-to-bottom flow. The Data Contributor is linked to "Submit Data." An arrow flows to "Perform Initial Approval," which is linked to the generic "Initial Approver" actor. The flow continues to "Perform Central Validation" and "Perform Subjective Scoring," both linked to the Central Committee Member.)

2.4.3.	Diagram 3: Reporting & Analytics
This diagram illustrates how different users consume the data and results generated by the system. It visualizes the relationships between user types, the reports they can access, and the dependent export functionality.
Figure 3: Reporting & Analytics
 
Visual Diagram: (This diagram shows the Public User and the generic Authenticated User connected to View Public Dashboards. The Authenticated User (representing all logged-in roles) is also connected to View Internal Reports. Arrows from both viewing use cases point to Export Reports, indicating it is a dependent, follow-on action.)

2.5.	System Context Diagram
2.5.1.	Purpose
The System Context Diagram defines the boundary and scope of the E-GIRS system. It illustrates the external entities (actors and other systems) that interact with the platform and the high-level data that flows between them and the system. This diagram is essential for understanding the system's place within its operational environment and identifying all external dependencies.
2.5.2.	Diagram
 
Figure 4: System Context Diagram
Visual Diagram Description: (This diagram shows the E-GIRS Platform as the central system. It is surrounded by the external entities it interacts with: Authenticated Internal Users, the Public User, an Email Server, and an SMS Gateway. The labeled boxes represent the data, and the arrows show the direction of the flow to and from the central platform.)

 

2.5.3.	Component Breakdown
Component	Type	Description
E-GIRS Platform	Central System	The complete software system being specified in this document.
Authenticated Internal Users	Actor Group	Represents all logged-in users of the system.
Public User	Actor	Represents any unauthenticated member of the public.
Email Server	External System	An external service used to send all outgoing emails.
SMS Gateway	External System	An external service provider used to send SMS messages for 2FA.

Data Flow	From -> To	Description
Login, Data, Decisions, Configs	Authenticated Users -> E-GIRS	Represents all data inputs from logged-in users.
Dashboards, Reports, Notifications	E-GIRS -> Authenticated Users	Represents all information presented to logged-in users.
View Requests	Public User -> E-GIRS	Represents the actions a public user takes to navigate the public dashboards.
Public Visualizations	E-GIRS -> Public User	Represents the final dashboards, maps, and charts displayed to the public.
Email Content to Send	E-GIRS -> Email Server	The formatted content of an email that the system sends for delivery.
OTP Code to Send	E-GIRS -> SMS Gateway	The One-Time Password and phone number sent to the gateway for delivery.
Delivery Status	Email/SMS -> E-GIRS	An optional confirmation message sent back from the external gateways.


2.6.	2.6. High-Level Data Flow Diagram (DFD)
2.6.1.	Purpose
This Level 1 Data Flow Diagram illustrates the primary processes within the E-GIRS system and shows how data moves between those processes, external entities (users), and data stores (databases). It provides a high-level view of the system's functional decomposition, focusing on the transformation of data from raw submission to final reports.
2.6.2.	Diagram
 
Figure 5: High-Level Data Flow Diagram (DFD)
Visual Diagram Description:(This diagram shows four main processes: Manage System Configuration, Process & Validate Submissions, Calculate & Aggregate Scores, and Generate Reports. Arrows indicate the flow of data from external users (like the Data Contributor), into processes, between processes and data stores (like the Submissions DB and Calculated Scores DB), and finally out to users as reports.)

2.6.3.	Component Breakdown
This section describes the key processes and data stores shown in the diagram.
Processes:
Process ID	Process Name	Description
1.0	Manage System Configuration	This process handles the creation and management of the foundational data for the system. It takes input from the MInT Administrator to define Assessment Years, Dimensions, Indicators, and user roles, and stores this information in the Framework & Config DB.
2.0	Process & Validate Submissions	This is the core workflow engine. It accepts raw data from Data Contributors, reads the framework to present the correct questions, and facilitates the multi-stage approval and validation process with Initial Approvers and the Central Committee. It reads and writes exclusively to the Submissions DB.
3.0	Calculate & Aggregate Scores	This process is triggered after a submission is fully validated. It reads the validated data, retrieves the necessary weights from the framework, accepts subjective scores from the Central Committee, and performs all normalization, scoring, and aggregation logic. It writes its final output to the Calculated Scores DB.
4.0	Generate Reports	This process is responsible for all data output. It receives requests from users and queries the data stores to construct the requested visualizations. For public dashboards, it primarily uses the Calculated Scores DB. For detailed internal reports, it may also query the Submissions DB for raw answers and notes.
Data Stores:
Data Store Name	Description
Framework & Config DB	This data store holds all the configuration data for the system. This includes the definitions for all Assessment Years, Dimensions, Indicators, weights, administrative units, and user accounts.
Submissions DB	This data store contains all the raw, transactional data related to the assessment workflow. It stores every answer, evidence link, approval decision, rejection reason, and validation note. It tracks the status of each submission as it moves through the workflow.
Calculated Scores DB	This data store holds the final, computed results of the assessment. After the calculation engine runs, this store contains the final normalized scores for every indicator, dimension, and administrative unit. It is optimized for fast read access by the reporting process.
 

2.7.	Assumptions and Dependencies
The successful development, deployment, and operation of the E-GIRS rely on several key assumptions and external dependencies. These factors must be considered throughout the project lifecycle.
Table 3 Assumptions and Dependencies
Assumption/Dependency	Description
Availability of MInT Domain Experts	The project assumes active participation and timely input from MInT domain experts for defining the assessment framework, KPIs, weighting, and providing clarifications on e-government policies and UN EGDI methodologies.
Cooperation from Participating Government Entities	Successful data collection depends on the timely and accurate submission of data by designated personnel from all participating Regional, and City Administrations.
Stable Internet Access for Users	It is assumed that Data Providers and MInT Administrators will have stable internet connectivity to access and interact with the web-based E-GIRS platform.
National Datacenter Availability & Support	The E-GIRS is to be deployed at the national datacenter. Assumed availability of the necessary infrastructure (servers, network, security) and technical support from the datacenter operations team.
Clear Data Governance Policies	Assumption that MInT will provide clear guidelines on data ownership, stewardship, sharing, and privacy related to the data collected and managed by E-GIRS.
End-User Training and Capacity Building	It is assumed that MInT will facilitate or the project will include adequate training and onboarding for Data Providers and other system users to ensure effective utilization of the E-GIRS.
Technical Skills for Maintenance (Post-Warranty)	Assumes that MInT will have or will develop the technical capacity to maintain and support the system after the initial warranty period, or will make provisions for ongoing support.
2.8.	Constraints
The development and deployment of the E-GIRS are subject to several constraints that may impact its design, functionality, timeline, and overall performance.
•	Regulatory and Compliance Constraints: The E-GIRS must comply with Ethiopian data protection laws, information security policies, and any relevant government ICT standards.
•	Resource Availability (MInT): The availability of MInT personnel (for requirements, feedback, UAT) and other resources (e.g., for content creation, training logistics) may influence project timelines and scope.
•	Budgetary Constraints: The project must be delivered within the allocated budget, which may limit the scope of features or the choice of technologies if not adequately planned.
•	Timeline for Deployment: The TOR specifies a two-month completion period after contract endorsement. This aggressive timeline imposes significant constraints on development, testing, and deployment activities.
•	Technical Infrastructure Limitations: While deployment is planned for the national datacenter, any unforeseen limitations in the existing infrastructure could pose constraints.
•	Data Quality from Source Entities: The accuracy and reliability of the eGov Index heavily depend on the quality of data submitted by participating organizations. 
•	Scope of Initial Framework: The initial assessment framework (dimensions, KPIs) defined by MInT will dictate the initial complexity of the data collection forms and calculation engine. Future changes to the framework will require system updates.
•	User Technical Proficiency: The design must consider the varying levels of technical proficiency among Data Providers from different government entities to ensure ease of use.
•	Data Volume and Performance: While designed for scalability, the system must perform efficiently during peak data submission periods and when generating complex BI reports and dashboards. Specific performance targets for concurrent users or report generation times should be considered if available.
 
3.	Functional Requirements
3.1.	System Administration & User Management
3.1.1.	Administrative Unit Management
User Story ID	001	
User Story	As an Administrator, I want to register Federal Institutes using a dedicated form, so that these non-scored entities are established in the system for the parallel informational data collection workflow.
Acceptance Criteria	•	When the Administrator registers a unit and selects 'Federal Institute' as the Unit Type, the form must not require a Parent Unit ID.
•	The registered institute must be available for assignment to an Institute Administrator and other federal roles.
•	UI/UX: A dedicated, standalone form titled "Register Federal Institute" must be used, which is clearly separate from the regional hierarchy forms.
Data Attributes	•	UnitID, Integer, Auto-generated, Primary Key.
•	OfficialUnitName, Varchar (100), Required, Unique.
•	UnitType, Varchar (30), Required, Validation: ['Federal Institute'].
•	ParentUnitID, Integer, Nullable (Must be NULL for this unit type).
UX Flow & Navigation	1.	Administrator navigates to Administration -> Administrative Unit Management -> Register Federal Institute.
2.	Enters the Official Unit Name (e.g., Ministry of Health).
3.	Clicks 'Save Institute'.
Notes / Assumptions	•	These units are for informational data collection only and are not part of the E-GIRS index calculation. They do not have a score.

User Story ID	002	
User Story	As an Administrator, I want to register Regional and City Administrations using a dedicated form, so that the system establishes the top level of the administrative hierarchy for the final index calculation units.
Acceptance Criteria	•	When the Administrator registers a unit and selects 'Region' or 'City Administration' as the Unit Type, then the form must not require a Parent Unit ID. 
•	The registered unit must be available for linking as the parent unit for Zones/Sub-cities.
•	UI/UX: A dedicated, standalone form titled "Register Regional/City Administration Unit" must be used, which clearly identifies this unit as the highest level.
Data Attributes	•	UnitID, Integer, Auto-generated, Primary Key. 
•	OfficialUnitName, Varchar (100), Required, Unique. 
•	UnitType, Varchar (30), Required, Validation: ['Region', 'City Administration']. 
•	ParentUnitID, Integer, Nullable (Must be NULL for this level).
UX Flow & Navigation	4.	Administrator navigates to Administration -> Administrative Unit Management -> Register Regional/City Administration.
5.	Enters the Official Unit Name (e.g., Oromia Region or Addis Ababa City Administration).
6.	Selects the appropriate Unit Type (Region or City Administration).
7.	Clicks 'Save Unit'.
Notes / Assumptions	•	These units represent the highest level for which a final E-GIRS score is produced.

User Story ID	003	
User Story	As an Administrator, I want to register Zone and Sub-city administrative units using a dedicated form and mandatorily link them to their Parent Regional or City Administration, so that the system correctly establishes the second tier of the hierarchical structure for aggregation.
Acceptance Criteria	•	When the Administrator registers a unit and selects 'Zone' or 'Sub-city' as the Unit Type, then the dedicated form must mandatorily require selection of an existing Parent Region or City Administration (from Story 011).
•	The registered Zone/Sub-city must be available in the lookup list for subsequent Woreda registration.
•	UI/UX: A dedicated, standalone form titled "Register Zone/Sub-city Unit" is used, featuring a mandatory dropdown labeled 'Parent Regional/City Administration'.
Data Attributes	•	UnitID, Integer, Auto-generated, Primary Key.
•	OfficialUnitName, Varchar (100), Required, Unique within parent.
•	UnitType, Varchar (30), Required, Validation: ['Zone', 'Sub-city'].
•	ParentUnitID, Integer, Foreign Key (Self-Referencing to UnitID), Required, Must link to a UnitType: ['Region', 'City Administration'].
UX Flow & Navigation	1.	Administrator navigates to Administration -> Administrative Unit Management -> Register Zone/Sub-city.
2.	Enters the Official Unit Name. 
3.	Selects the appropriate Parent Unit from the lookup list. 
4.	Clicks 'Save Unit'.
Notes / Assumptions	•	The Zone/Sub-city score will be calculated by averaging the scores of its child Woredas, per the provided aggregation formula.

User Story ID	004	
User Story	As an Administrator, I want to register Woreda administrative units using a dedicated form and mandatorily link them to their Parent Zone or Sub-city, so that the Woredas are correctly defined as the lowest level for data collection and initial scoring.
Acceptance Criteria	•	When the Administrator registers a unit and selects 'Woreda' as the Unit Type, then the dedicated form must mandatorily require selection of an existing Parent Zone or Sub-city (from Story 017).
•	The registered Woreda must be available for assignment to the Data Contributor role for data collection (Story 005).
•	UI/UX: A dedicated, standalone form titled "Register Woreda Unit" is used, featuring a mandatory dropdown labeled 'Parent Zone/Sub-city'.
Data Attributes	•	UnitID, Integer, Auto-generated, Primary Key.
•	OfficialUnitName, Varchar (100), Required, Unique within parent.
•	UnitType, Varchar (30), Required, Validation: ['Woreda'].
•	ParentUnitID, Integer, Foreign Key (Self-Referencing to UnitID), Required, Must link to a UnitType: ['Zone', 'Sub-city'].
UX Flow & Navigation	1.	Administrator navigates to Administration -> Administrative Unit Management -> Register Woreda. 
2.	Enters the Official Unit Name.
3.	Selects the appropriate Parent Unit (Zone/Sub-city) from the lookup list.
4.	Clicks 'Save Unit'.
Notes / Assumptions	•	The Woreda is the source level for the initial data collection and scoring, meaning Data Contributors are linked to this level.

3.1.2.	User Authentication and Access Control
User Story ID	005	
User Story	As an authorized Administrator, I want to create and manage user accounts and assign them to the correct administrative unit and a context-specific role, so that a secure, role-based workflow is established for both regional assessments and federal data collection.
Acceptance Criteria	•	Given a new user needs access, when the Administrator creates the account, they must first select an Official Administrative Unit (e.g., Woreda, Region, or Federal Institute) from the registered lookup list.
•	The available Role dropdown options must be dynamically filtered based on the UnitType of the selected administrative unit.
o	When a Regional, City, Zone, or Woreda unit is selected, the available roles must be:
	Data Contributor
	Regional Approver
o	When a Federal Institute unit is selected, the available roles must be:
	Institute Data Contributor
	Federal Approver
•	The system must support the central roles (Central Committee Member, Chairman, Secretary) which are not tied to a specific unit.
•	When the Super Administrator creates the Chairman's account, the Chairman must then be able to create accounts for other Central Committee Members and the Secretary.
•	UI/UX: The user creation form must contain mandatory fields for Username, Email, a required dropdown for selecting the Official Unit Name, and a context-aware dropdown to select the assigned Role.
Data Attributes	•	UserID, Integer, Auto-generated, Primary Key.
•	OfficialUnitID, Integer, Required, Foreign Key to Administrative Units table.
•	Username, Varchar (50), Required, Unique. 
•	RoleID, Integer, Required, Foreign Key to Roles table.
UX Flow & Navigation	1.	Administrator navigates to Administration -> User Management. 
2.	Clicks the 'Create New User' button. 
3.	Enters user details, selects the Official Unit Name from the lookup, and selects a specific Role. 
4.	Clicks 'Save User'.
Notes / Assumptions	User accounts must be registered under the official name of the respective organization.

User Story ID	006	
User Story	As a Registered User, I want the system to enforce email verification and support optional Two-Factor Authentication (2FA) via SMS, along with a secure password recovery process, so that my account is protected from unauthorized access.
Acceptance Criteria	•	Initial Verification: When a new user account is created, the system must require successful email verification via a time-limited link before the account status is set to 'Active'.
•	Password Complexity: The system must enforce strong password complexity rules during account creation and password reset, including:
o	Minimum length of 8 characters.
o	Must include at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.
•	Two-Factor Authentication (2FA):
o	Users must have the option to enable 2FA in their profile by providing a valid mobile phone number.
o	If 2FA is enabled, after successfully entering their password, the user must be prompted to enter a one-time password (OTP) sent to their registered mobile number via SMS.
o	The login is only successful after both the password and the correct OTP are provided.
•	Password Recovery: When a user initiates the password recovery process, the system must send a secure, time-limited reset link to their registered email address.
•	Security: The system must employ a secure hashing and salting algorithm for storing all user passwords.
•	UI/UX: The login screen must include a visible 'Forgot Password' link. The user profile page must have a clear section for managing 2FA.
Data Attributes	•	PasswordHash, Varchar (255), Required, must use secure hashing algorithm
•	EmailVerificationToken, Varchar (100), Required during registration.
•	IsEmailVerified, Boolean, Default=False.
•	IsAccountLocked, Boolean, Default=False (for failed login attempts).
•	PhoneNumber, Varchar (20), Nullable, Required for 2FA.
•	IsTwoFactorEnabled, Boolean, Default=False.
•	TwoFactorSecret, Varchar (255), Nullable, Encrypted.
UX Flow & Navigation	Password Recovery:
1.	 User navigates to Login Page and clicks 'Forgot Password'.
2.	Enters registered email; system sends reset link.
3.	User clicks link and securely resets password.
4.	User logs in using new credentials.
Login with 2FA:
1.	User enters username and password on the Login Page.
2.	System validates credentials.
3.	System redirects to a new screen prompting for the "Verification Code from SMS".
4.	User enters the OTP received via SMS and is granted access.
Notes / Assumptions	This story covers secure login, initial account verification via email, enhanced security via optional SMS-based 2FA, and password recovery. An SMS gateway service will need to be integrated for this functionality.
3.1.3.	Role-Based Dashboard 
User Story ID	007	
User Story	As an authenticated internal user, I want to see a personalized workflow dashboard immediately after logging in, so that I can view the status of tasks relevant to my role and quickly navigate to my primary functions.
Acceptance Criteria	•	The system must display a dashboard as the default landing page after a successful login.
•	The content of the dashboard must be dynamically rendered based on the user's assigned role.
o	For an Institute Data Contributor: Displays the status of their institute’s informational submission and a "Start / Edit Informational Form" button.
o	For a Federal Approver: Displays a summary card with a count of informational forms "Awaiting Your Approval" and provides a direct link to the Federal Approval Queue.
o	For a Data Contributor: The dashboard must display the status of their assigned Woreda's submission (e.g., 'Draft', 'Rejected') and provide a prominent "Start / Edit Submission" button.
o	For a Regional Approver: The dashboard must display a summary card with a count of submissions currently "Awaiting Your Approval" and provide a direct link to the Regional Approval Queue.
o	For a Central Committee Member: The dashboard must display a summary card with a count of submissions "Awaiting Final Validation" and provide a direct link to the Central Validation Queue.
o	For a MInT Administrator: The dashboard must display a high-level administrative overview with key statistics, such as the number of submissions in each stage of the entire workflow (Draft, Pending Regional Approval, Pending Final Validation, Completed).
Data Attributes	•	UserID, RoleID, SubmissionStatus
•	SubmissionCounts_by_Status.
Notes / Assumptions	This dashboard is crucial for system usability and efficient workflow management for all internal users.
3.1.4.	Workflow Notifications
User Story ID	008	
User Story	As a system user (Approver, Contributor), I want to receive automated email notifications for key workflow events, so that I am promptly informed of tasks requiring my attention and the status of my submissions.
Acceptance Criteria	•	The system must automatically generate and send an email notification when the following events occur:
o	Submission Received for Approval: When a Data Contributor submits a form, an email is sent to the relevant Initial Approver(s) for that unit's hierarchy.
o	Submission Rejected by Initial Approver: When an Initial Approver rejects a submission, an email is sent back to the original Data Contributor, including the rejection reason.
o	Submission Rejected by Central Committee: When the Central Committee rejects a submission, an email is sent to the Initial Approver, including the Committee's rejection reason.
•	All email notifications must contain a clear subject line and a direct link to the relevant submission within the E-GIRS platform.
•	The system must log all outgoing notifications for auditing and troubleshooting purposes.
Data Attributes	•	NotificationLogID, Integer, Primary Key.
•	RecipientEmail, Varchar (255), Required.
•	Subject, Varchar (255), Required.
•	Timestamp, DateTime, Required.
•	Status, Varchar (20), Required (e.g., 'Sent', 'Failed').
Dependencies:	This functionality is critically dependent on the successful integration with the external Email Server defined in the System Context Diagram

User Story ID	009	
User Story	As an authenticated user, I want to view a list of recent, relevant events in an in-app notification center, so that I can stay informed about the status of my work and key system activities without leaving the application.
Acceptance Criteria	•	The system's main navigation bar must include a notification icon (e.g., a bell).
•	The icon must display a badge with a count of unread notifications.
•	Clicking the icon must open a dropdown panel listing recent notifications in chronological order.
•	The notification list must include events such as:
o	"Submission for [Unit Name] has been approved by [Approver Name]."
o	"Submission for [Unit Name] has been validated by the Central Committee."
o	"You have [X] new submissions in your approval queue."
•	Each notification in the list must be a clickable link that navigates the user directly to the relevant submission or queue.
•	The system must provide a mechanism to mark notifications as read, either individually or via a "Mark all as read" option.
Data Attributes	•	InAppNotificationID, Integer, Primary Key.
•	UserID, Integer, Foreign Key (the recipient).
•	Message, Text, Required.
•	LinkURL, Varchar (2048), Nullable.
•	IsRead, Boolean, Default: False.
•	Timestamp, DateTime, Required.
	

3.2.	Indicator & Methodology Management
3.2.1.	Assessment Framework Management

User Story ID	010	
User Story	As an Administrator, I want to create and manage Assessment Years, so that I can define a complete and independent assessment framework for each reporting cycle.
Acceptance Criteria	•	The Administrator must be able to create a new Assessment Year (e.g., "2025", "2027").
•	Each Assessment Year must have a status (e.g., 'Draft', 'Active', 'Archived') to control its visibility and data entry permissions.
•	All subsequent framework components (Dimensions, Indicators) must be mandatorily linked to a specific Assessment Year.
Data Attributes	•	AssessmentYearID, Integer, Auto-generated, Primary Key.
•	YearName, Varchar (50), Required, Unique (e.g., "2025 Assessment").
•	Status, Varchar (20), Required, Default: 'Draft'.
UX Flow & Navigation	1.	Administrator navigates to Configuration -> Assessment Frameworks.
2.	Clicks 'Create New Assessment Year'.
3.	Enters the year/name and saves. The system then allows the admin to start building the framework for that year.
	

User Story ID	011	
User Story	As an Administrator, I want to define the top-level, weighted Assessment Dimensions for a specific Assessment Year, so that I can establish the primary pillars of the E-GIRS calculation formula.
Acceptance Criteria	•	When creating a dimension, the Administrator must first select the AssessmentYearID it belongs to.
•	The form must include a mandatory field for DimensionWeight (a percentage value).
•	System Validation: The system must enforce that the SUM of DimensionWeight for all dimensions within a single AssessmentYearID must equal exactly 100.
•	UI/UX: The management interface should display a running total of the dimension weights for the selected Assessment Year (e.g., "Total Weight: 80 / 100").
Data Attributes	•	DimensionID, Integer, Auto-generated, Primary Key.
•	AssessmentYearID, Integer, Required, Foreign Key.
•	DimensionName, Varchar (100), Required, Unique within the Assessment Year.
•	DimensionWeight, Decimal (5,2), Required.
UX Flow & Navigation	1.	From the Assessment Frameworks list, the Administrator clicks 'Manage' next to a specific Assessment Year.
2.	On the framework management page, navigates to the 'Assessment Dimensions' section.
3.	Clicks the 'Add New Dimension' button.
4.	Enters the Dimension Name (e.g., "Infrastructure Readiness") and its weight (e.g., 30 for 30%).
5.	Clicks 'Save Dimension'. The running total for the year is updated.
	

3.2.2.	Indicator Definition 

User Story ID	012	
User Story	As an Administrator, I want to create and manage Indicators, assigning each a relative weight within its parent Dimension and specifying its applicable government level, so that I can build the detailed, hierarchical questionnaire.
Acceptance Criteria	•	When creating an Indicator, the Administrator must select its parent Assessment Dimension.
•	The form must include a mandatory field for IndicatorWeight (a percentage value).
•	System Validation: The system must enforce that the SUM of IndicatorWeight for all indicators linked to the same parent DimensionID must equal exactly 100.
•	The form must include a mandatory field, ApplicableUnitType (e.g., 'Woreda', 'Federal Institute').
Data Attributes	•	IndicatorID, Integer, Auto-generated, Primary Key.
•	DimensionID, Integer, Required, Foreign Key.
•	IndicatorName, Varchar (255), Required.
•	IndicatorWeight, Decimal (5,2), Required.
•	ApplicableUnitType, Varchar (30), Required.
UX Flow & Navigation	1.	From the 'Assessment Dimensions' list, the Administrator clicks 'Manage Indicators' next to a specific dimension.
2.	On the Indicator management page, clicks the 'Add New Indicator' button.
3.	A form appears. The Administrator enters the Indicator Name and its relative weight within this dimension (e.g., 15 for 15%).
4.	Selects the Applicable Unit Type from a dropdown list.
5.	Clicks 'Save Indicator'. The running total for the parent dimension is updated.
•	Notes / Assumptions:
	•	This IndicatorWeight represents the indicator's contribution relative to other indicators within the same dimension. The final, absolute weight of the indicator in the total score is calculated by the system as: (DimensionWeight / 100) * (IndicatorWeight / 100). This model allows administrators to change a parent Dimension's weight without having to manually edit all of its child indicators.


User Story ID	013	
User Story	As an Administrator, I want to add and manage multiple types of sub-questions under a Parent Indicator, so that I can build the detailed assessment structure exactly as specified in the methodology.
Acceptance Criteria	•	The system must allow an Administrator to add one or more Sub-Questions linked to a ParentIndicatorID.
•	For each sub-question, the Admin must define its SubWeight as a percentage of the parent's total weight.
•	The Admin must select the ResponseType for the sub-question from a list that includes: 
o	Yes/No
o	Multiple-Select Checkbox
o	Text Explanation.
•	The Admin must be able to define the specific options for a Multiple-Select Checkbox question.
•	UI/UX: The "Manage Sub-Questions" interface will show the Parent Indicator's details and a list of its sub-questions, with options to add, edit, or delete them.
Data Attributes	•	SubQuestionID, Integer, Primary Key.
•	ParentIndicatorID, Integer, Foreign Key.
•	SubQuestionText, Text, Required.
•	SubWeightPercentage, Decimal (5,2), Required.
•	ResponseType, Varchar (30), Required, ['Yes/No', 'MultipleSelectCheckbox', 'TextExplanation'].
UX Flow & Navigation	1.	From the Parent Indicator view, Administrator clicks "Add Sub-Question".
2.	Enters the question text.
3.	Enters the SubWeightPercentage.
4.	Selects ResponseType: 'MultipleSelectCheckbox'.
5.	An interface appears to add the checkbox options.
6.	Clicks 'Save Sub-Question'.

3.3.	Data Collection & Validation Workflow
3.3.1.	Data Submission
User Story ID	014	
User Story	As a Data Contributor, I want to initiate a data submission for my assigned administrative unit, answer all relevant questions, provide evidence, and save my progress as a draft, so that I can complete the detailed data entry before submitting it for approval.
Acceptance Criteria	•	When a new submission is created, it must be linked to the UnitID associated with the Data Contributor's account.
•	The data entry form must dynamically render only the Indicators and Sub-Questions where the ApplicableUnitType matches the contributor's unit type.
•	The form must display the correct input control for each sub-question (Yes/No, checkboxes, text area, etc.).
•	The user must be able to save their entire submission, including all answers and evidence, as a draft.
•	UI/UX: The data entry form must be clearly titled with the unit's Official Name. A 'Save Draft' button must be distinct from the 'Submit for Approval' button.
Data Attributes	•	SubmissionID, Integer, Auto-generated, Primary Key.
•	UnitID, Integer, Required, Foreign Key to Administrative Units table.
•	SubmissionStatus, Varchar (25), Required, Default: 'Draft'.
•	ResponseID, Integer, Auto-generated, Primary Key.
•	SubmissionID, Integer, Foreign Key.
•	SubQuestionID, Integer, Foreign Key.
•	ResponseValue, Varchar (MAX), Stores text, selected checkbox values, etc.
•	EvidenceLink, Varchar (2048), Nullable.
•	EvidenceFilePath, Varchar (255), Nullable.
UX Flow & Navigation	1.	Data Contributor logs in and navigates to "Start/Edit Submission for [Unit Name]".
2.	The system loads the form with the relevant questions for their unit type.
3.	The user enters answers and provides evidence.
4.	The user clicks 'Save Draft' to save progress or 'Submit for Approval' to finalize.
Notes / Assumptions	Data is now captured and stored at the SubQuestionID level. The Submission table acts as a container for all the individual responses.
3.3.2.	Initial Approval
User Story ID	015	
User Story	As an Initial Approver (Regional Approver, Federal Approver), I want to review complete data submissions from units within my scope and either approve them for central validation or send them back for revision, so that I can ensure data quality.
Acceptance Criteria	•	The Approver's queue must show submissions from units that fall under their administrative hierarchy with the status 'Pending Initial Approval'.
•	When sending a submission back for revision, the approver must enter comments in a RejectionReason text field.
•	When approved, the SubmissionStatus changes to 'Pending Central Validation', and the data is locked from further editing by the Data Contributor.
Data Attributes	•	SubmissionID, Integer, Primary Key.
•	ApproverUserID, Integer, Foreign Key.
•	ApprovalDate, DateTime, Nullable.
•	SubmissionStatus, Varchar (25), Updated to 'Submitted for Validation' or back to 'Draft'.
•	RejectionReason, Text, Nullable, Required if status is changed back to 'Draft'.
UX Flow & Navigation	1.	Initial Approver navigates to their Approval Queue.
2.	Selects a submission to review.
3.	Clicks 'Approve' to send it to the Central Committee, or clicks 'Send Back for Revision', enters a reason, and submits.
Notes / Assumptions	The RejectionReason attribute is crucial for a functional workflow, providing a clear feedback loop between the approver and the data contributor.

3.3.3.	Central Validation
User Story ID	016	
User Story	As a Central Committee Member, I want to review the submitted answers and evidence for each question, and either Approve or Reject them, so that I can perform the final validation before any scores are calculated.
Acceptance Criteria	•	The Central Committee's queue must show submissions with the status 'Pending Central Validation'.
•	The review interface must display each question, the submitted answer, and the provided evidence.
•	The Committee Member must have two primary actions: 'Approve' and 'Reject'.
•	If 'Reject' is chosen, the member must provide a reason in a mandatory comment field. The submission is then sent back to the Initial Approver's queue with the status 'Rejected by Central Committee'.
•	If 'Approve' is chosen, the member has the option to add a GeneralNote for historical context or future reference.
•	Once all answers in a submission are approved, the overall SubmissionStatus changes to 'Validated', locking the data and making it ready for the calculation engine.
Data Attributes	•	ValidationStatus (per response), Varchar (20), ['Approved', 'Rejected'].
•	CentralRejectionReason, Text, Nullable, Required if ValidationStatus is 'Rejected'.
•	GeneralNote, Text, Nullable, Can be added to an 'Approved' response.
UX Flow & Navigation	1.	Committee Member navigates to the Central Validation Queue and selects a submission.
2.	Reviews the first question and answer. Clicks 'Approve' and optionally adds a note.
3.	Reviews the second question, finds an error, clicks 'Reject', types "The evidence link is broken," and submits the rejection.
4.	The entire submission is now removed from the Central queue and appears in the Initial Approver's queue with the Committee's comments.
	

User Story ID	017	
User Story	As an Initial Approver, I want to manage submissions after they have been reviewed by the Central Committee, so that I can efficiently handle rejections that require action and review notes on approved submissions for future improvement.
Acceptance Criteria	•	The system must provide a clear and unified interface for the Initial Approver to see the status of submissions that have been processed by the Central Committee.
•	For Submissions Rejected by the Central Committee:
o	The submission must appear in the Initial Approver's primary work queue with a clear status (e.g., 'Rejected by Central Committee').
o	The rejection reasons provided by the Committee must be clearly visible.
o	The Initial Approver must have two distinct actions available:
	'Edit and Resubmit': Allows the approver to directly open the form, correct the data, and resubmit it to the Central Committee's queue.
	'Reject to Contributor': Allows the approver to send the submission back to the original Data Contributor's draft queue, appending their own comments along with the Committee's feedback.
•	For Submissions Approved by the Central Committee:
o	The system must provide a view or report (e.g., "Validated Submissions Report") where the Initial Approver can access fully 'Validated' submissions from their scope.
o	When viewing a validated submission, any GeneralNote left by the Central Committee must be clearly displayed alongside the corresponding approved answer.
o	This view of validated submissions and notes must be read-only.
Data Attributes	•	ValidationStatus (per response), Varchar (20), ['Approved', 'Rejected'].
•	CentralRejectionReason, Text, Nullable, Required if ValidationStatus is 'Rejected'.
•	GeneralNote, Text, Nullable, Can be added to an 'Approved' response.
UX Flow & Navigation	1.	UX Flow & Navigation:
2.	Handling a Rejection:
a.	An Initial Approver sees a submission in their queue with the status 'Rejected by Central Committee'.
b.	They open the submission and read the Committee's comment: "The evidence link is broken."
c.	The approver knows the correct link, so they click 'Edit and Resubmit', paste the correct link, and send it back to the Central Committee.
d.	Alternatively, if they don't know the link, they click 'Reject to Contributor', add a comment, and send it back to the Data Contributor.
3.	Reviewing an Approved Note:
a.	The Initial Approver navigates to the "Validated Submissions Report".
b.	They open a recently approved submission to review the outcomes.
c.	Alongside an answer, they see a GeneralNote from the Committee: "Approved, but for the next cycle, please provide the direct policy document."
d.	The approver makes a note of this for future training and guidance.
	

3.4.	Core Calculation & Scoring Engine
3.4.1.	Subjective Scoring by Central Committee
User Story ID	018	
User Story	As a Central Committee Member, I want to access a dedicated scoring queue for validated submissions with text-based answers, so that I can assign a quantitative score to these subjective responses.
Acceptance Criteria	•	A new queue, "Pending Subjective Scoring," must be available to Central Committee Members.
•	This queue will only contain submissions that are 'Validated' and have answers to sub-questions with a ResponseType of 'Text Explanation'.
•	The scoring interface must display the question, the validated answer, and the evidence.
•	The Committee Member must be required to select a score from a predefined scale (1 for 'Meets Expectations', 0.5 for 'Partially Meets', 0 for 'Does Not Meet').
•	The system must support multiple committee members scoring the same answer, and it will store the average of all assigned scores as the final score for that response.
•	Once all subjective answers in a submission are scored, its status changes to 'Scoring Complete'.
Data Attributes	•	ResponseID, Integer, Foreign Key.
•	CommitteeMemberID, Integer, Foreign Key.
•	AssignedScore, Decimal (2,1), Required.
•	FinalSubQuestionScore, Decimal (5,4), Calculated (average of all assigned scores).
	

3.4.2.	Nnormalization
User Story ID	019	
User Story	As the E-GIRS System, I want to apply a normalization logic to convert all validated and scored answers to a common 0-1 scale, so that they are mathematically consistent for weighted calculations.
Acceptance Criteria	•	This process runs automatically on submissions with a status of 'Scoring Complete'.
•	The system must implement the following normalization rules for each sub-question response:
o	For Yes/No: Use the binary value (1 for 'Yes', 0 for 'No').
o	For Multiple-Select: Use the proportional score (e.g., 3 selected / 4 total = 0.75).
o	For Scaled Response (1-5): Use the formula (Score - 1) / (5 - 1).
o	For Text/Qualitative: Use the FinalSubQuestionScore (the average score from CALC-001).
Data Attributes	•	NormalizedScore, Decimal (5,4), Calculated and stored for each response.
	

3.4.3.	Indicator Scoring
User Story ID	020	
User Story	As the E-GIRS System, I want to calculate the final Indicator Score by computing the weighted sum of its normalized sub-question scores, so that a single performance score is created for each Indicator.
Acceptance Criteria	•	The system must use the SubWeightPercentage defined in the Assessment Framework.
•	The formula is: IndicatorScore = SUM(NormalizedScore * (SubWeightPercentage / 100)) for all sub-questions under that indicator.
•	This calculation results in a single, normalized (0-1) IndicatorScore for each indicator in the submission.
	
3.4.4.	Dimension Calculation
User Story ID	021	
User Story	As the E-GIRS System, I want to calculate the score for each Assessment Dimension by computing the weighted sum of its child Indicator Scores, so that a performance score is established for each thematic pillar.
Acceptance Criteria	•	The system must use the IndicatorWeight defined in the Assessment Framework for the relevant AssessmentYear.
•	The formula is: DimensionScore = SUM(IndicatorScore * (IndicatorWeight / 100)) for all indicators under that dimension.
•	This calculation is performed for each Assessment Dimension defined for the submission's Assessment Year.
	
3.4.5.	Unit Score and Hierarchical Aggregation
User Story ID	022	
User Story	As the E-GIRS System, I want to calculate the final score for any given administrative unit in the hierarchy by correctly aggregating the scores of all applicable indicators, whether they were answered by the unit itself or by its descendants.
Acceptance Criteria	•	The final score for any administrative unit (e.g., a Region, a Zone) must be calculated based on the weighted sum of all indicator scores that apply to it.
•	The value for each indicator is determined as follows:
o	If the indicator's ApplicableUnitType matches the unit being calculated (e.g., calculating a Region's score for a Region-level indicator), the system uses the IndicatorScore from that unit's direct submission.
o	If the indicator's ApplicableUnitType is for a lower level (e.g., calculating a Region's score for a Woreda-level indicator), the system must first calculate the arithmetic mean of the IndicatorScores from all descendant units that answered it. This average value is then used as the indicator's score for the parent unit.
•	Once a value (either direct or averaged) is established for every applicable indicator, the system calculates the final UnitScore using the standard weighted formula: UnitScore = SUM(DimensionScore * (DimensionWeight / 100)).
Data Attributes	•	UnitScore, Decimal (7,4), Calculated.
•	FinalIndicatorValue (temporary, in-memory value for calculation), Decimal (7,4).
UX Flow & Navigation (System Process):	•	The system is triggered to calculate the final score for the "Oromia Region".
•	It gathers all indicators from the active Assessment Year.
•	For Indicator A (ApplicableUnitType = 'Region'): It retrieves the IndicatorScore directly from the Oromia Region's own submission.
•	For Indicator B (ApplicableUnitType = 'Zone'): It retrieves the IndicatorScore from every Zone within Oromia, calculates the average, and uses that average as the value for Indicator B.
•	For Indicator C (ApplicableUnitType = 'Woreda'): It retrieves the IndicatorScore from every Woreda within Oromia, calculates the average, and uses that average as the value for Indicator C.
•	With a final value for every indicator, it proceeds to calculate the DimensionScore and the final UnitScore for the Oromia Region.
	

User Story ID	023	
User Story	As the E-GIRS System, I want to calculate the final National Index by taking the arithmetic mean of all top-level Regional and City Administration index scores, so that a single, headline performance metric for the country is generated.
Acceptance Criteria	•	The NationalIndex must be calculated as the simple arithmetic mean of the final scores of all top-level administrative units (Regions and City Administrations).
•	UI/UX: The NationalIndex must be displayed as a headline KPI on the main public-facing dashboard.

 
4.	Calculation Engine Logic and Example
4.1.	Purpose
This appendix provides a detailed, step-by-step walkthrough of the E-GIRS scoring engine. Its purpose is to offer a clear and unambiguous example of how the system calculates a final composite score for a high-level administrative unit.
This example demonstrates the core principle of blended scoring, where the final score for a unit (like a Region) is a comprehensive combination of:
•	Scores from indicators the unit answered directly.
•	Aggregated average scores from indicators answered by its child units (e.g., Zones and Woredas).
4.2.	Scenario Setup
For this example, we will calculate the final composite score for the Oromia Region.
4.2.1.	Assessment Framework Configuration
The calculation is based on the following hypothetical framework defined for the active Assessment Year.
Table 1: Assessment Dimension Weights
Dimension Name	Weight
Infrastructure	40%
Service Delivery	60%
Total	100%

Table 2: Indicator Configuration
Indicator Name	Parent Dimension	Weight (within Dimension)	Applicable Unit Type
Indicator A: Policy Document	Infrastructure	25%	Region
Indicator B: Zone Connectivity	Infrastructure	75%	Zone
Indicator C: WoredaNet Usage	Service Delivery	100%	Woreda
Note: The sum of Indicator Weights within each parent dimension equals 100%.

4.2.2.	Submitted and Scored Data
The following table represents the final, normalized IndicatorScore (a value from 0 to 1) for each indicator after the data has been submitted and validated.
Table 3: Submitted Data (Indicator Scores)

Administrative Unit	Indicator Answered	IndicatorScore (0–1)
Oromia Region	Indicator A: Policy Document	0.90
		
Zone 1 (of Oromia)	Indicator B: Zone Connectivity	0.80
Zone 2 (of Oromia)	Indicator B: Zone Connectivity	0.60
		
Woreda 1 (of Oromia)	Indicator C: WoredaNet Usage	0.70
Woreda 2 (of Oromia)	Indicator C: WoredaNet Usage	0.50
Woreda 3 (of Oromia)	Indicator C: WoredaNet Usage	0.80
Woreda 4 (of Oromia)	Indicator C: WoredaNet Usage	0.60

4.3.	A.3 Step-by-Step Calculation for Oromia Region
The system follows these sequential steps to derive the final score.
Step 1: Establish Final Indicator Values for Oromia Region
The system first determines a single value for each indicator as it applies to the Oromia Region.
•	For Indicator A (Applicable Unit Type = 'Region'):The system uses the score submitted directly by the Oromia Region.
•	Final Value for Indicator A = 0.90
•	For Indicator B (Applicable Unit Type = 'Zone'):The system calculates the arithmetic mean of the scores from all Zones within Oromia.
•	Calculation: (0.80 + 0.60) / 2
•	Final Value for Indicator B = 0.70
•	For Indicator C (Applicable Unit Type = 'Woreda'):The system calculates the arithmetic mean of the scores from all Woredas within Oromia.
•	Calculation: (0.70 + 0.50 + 0.80 + 0.60) / 4
•	Final Value for Indicator C = 0.65
Table 4: Summary of Final Indicator Values for Oromia
Indicator	Final Value
Indicator A	0.90
Indicator B	0.70
Indicator C	0.65

Step 2: Calculate Assessment Dimension Scores for Oromia
Using the final indicator values from Step 1 and the indicator weights from the framework, the system calculates the score for each Assessment Dimension.
•	Infrastructure Dimension Score:
•	Formula: SUM (FinalIndicatorValue * (IndicatorWeight / 100))
•	Calculation: (0.90 * 0.25) + (0.70 * 0.75)
•	Calculation: 0.225 + 0.525
•	Infrastructure Score = 0.75
•	Service Delivery Dimension Score:
•	Formula: SUM(FinalIndicatorValue * (IndicatorWeight / 100))
•	Calculation: (0.65 * 1.00)
•	Service Delivery Score = 0.65
Table 5: Summary of Calculated Dimension Scores for Oromia
Dimension	Final Score
Infrastructure	0.75
Service Delivery	0.65

Step 3: Calculate the Final Composite Score for Oromia Region
Finally, the system applies the top-level Assessment Dimension weights to the dimension scores from Step 2 to arrive at the final composite score.
•	Oromia Region Final Composite Score:
•	Formula: SUM(DimensionScore * (DimensionWeight / 100))
•	Calculation: (0.75 * 0.40) + (0.65 * 0.60)
•	Calculation: 0.30 + 0.39
Final Composite Score for Oromia Region = 0.69

 
5.	Reporting & Visualization
This section defines the requirements for the system's public-facing dashboards and drill-down reports. The visualizations are designed to align with international best practices, such as those used by the UN e-Government Development Index, to provide transparency, trend analysis, and data-driven insights for all stakeholders.
5.1.	Report 1: National E-Government Performance Dashboard
This is the primary public landing page, providing a comprehensive national overview with KPIs, trend analysis, a comparative map, and rankings.
Property	Specification
Report Name	National E-Government Performance
Report ID	WEB-REPORT-EGOV-PERF-001
Report Type	Interactive Dashboard
Target Audience	Public Users (Unauthenticated)

Filter Label	Field Name	Field Type	Options / Linked Doctype
Assessment Year	assessment_year	Select	(Dynamic list of years with data, e.g., 2024, 2026)

A. Key Performance Indicators (KPIs / Summary Numbers):
•	National Index: Single number showing the final National_Index score for the selected year.
•	Dimension Score KPIs: A set of KPIs, one for each top-level Assessment Dimension, showing the national average score for that dimension. The labels will be dynamic based on the framework for the selected year (e.g., "Infrastructure Score: 0.65", "Service Delivery Score: 0.72").
•	Maturity Level Counts:
•	Units - Very High: Count of top-level administrative units with "Very High" maturity.
•	Units - High: Count of units with "High" maturity.
•	(And so on for Middle and Low).
B. Visualizations:
•	Visualization 1: National Performance Over Time (Line Chart)
•	Type: Multi-series Line Chart.
•	Logic: This chart displays the trend of the National_Index and each of the main Assessment Dimension scores over all available assessment years. The X-axis represents the Assessment Year, and the Y-axis represents the score (0-1). This allows users to see progress over time.
•	Visualization 2: National Maturity Map (Geographic Map)
•	Type: Geographic Map of Ethiopia.
•	Logic: Each top-level administrative unit is a colored region corresponding to its Maturity Level for the selected year. A tooltip on hover shows Unit Name, Rank, and E-GIRS Score. Clicking a region navigates to Report 2.
•	Visualization 3: Unit Performance Ranking (Bar Chart)
•	Type: Horizontal Bar Chart.
•	Logic: Plots the final E-GIRS Score for each top-level administrative unit for the selected year, ordered from highest to lowest. Bars are color-coded by Maturity Level.
C. Data Table:A ranking table displaying Rank, Unit Name, E-GIRS Score, and the score for each main Assessment Dimension for all top-level units. The Unit Name is a link to Report 2.
D. Backend Logic:The script queries the final calculated scores for all top-level units for the selected year, as well as historical data for previous years. It calculates the summary KPIs, processes data for the trend chart, map, and bar chart, and generates the ranking table.
•	Export Data Table as CSV/Excel: The main ranking data table will have its own "Export Data" button. This will allow users to download the raw tabular data in either CSV or XLSX format for use in spreadsheets and other analysis tools.

5.2.	Report 2: Unit Scorecard
This is a detailed drill-down report for a single top-level administrative unit, providing dimensional analysis and a performance breakdown of its sub-units.
Property	Specification
Report Name	Unit Scorecard
Report ID	WEB-REPORT-EGOV-SCORECARD-002
Report Type	Detailed Drill-Down Report
Target Audience	Public Users (Unauthenticated)

Filter Label	Field Name	Field Type	Options / Linked Doctype
Assessment Year	assessment_year	Select	(Dynamic list of years with data)
Unit Name	unit_name	Link	Administrative Unit

A. Key Performance Indicators (KPIs / Summary Numbers):
•	Overall Rank: String showing the unit's rank (e.g., "3 / 14").
•	E-GIRS Score: Single number showing the unit's final score.
•	Maturity Level: String showing the unit's maturity (e.g., "High").
B. Visualizations:
•	Visualization 1: Dimensional Performance Analysis (Radar Chart)
•	Type: Radar (Spider) Chart.
•	Axes: The Assessment Dimensions for the selected year.
•	Logic: Plots two datasets: 1) the selected unit's DimensionScore for each dimension, and 2) the National Average DimensionScore for each dimension, allowing for easy benchmarking.
•	Visualization 2: Intra-Unit Performance Map (Geographic Map)
•	Type: Geographic Map of the selected Region or City Administration.
•	Logic: Displays the constituent child units (e.g., Zones or Sub-cities) as colored regions. The color corresponds to the calculated score/maturity of that sub-unit. A tooltip on hover shows the Sub-Unit Name and its score.
C. Data Tables:
•	Table 1: Dimensional Performance: A table listing each Assessment Dimension, the unit's Dimension Score, the National Average, and the calculated "Gap / Surplus" for each.
•	Table 2: Sub-Unit Ranking: A ranking table of all child units (Zones/Sub-cities) within the selected top-level unit, displaying their name and calculated score.
D. Backend Logic:The script queries the calculated scores for the selected unit and year. It retrieves its Dimension Scores and calculates the national averages. It also queries the scores for all direct child units to populate the Intra-Unit Map and Sub-Unit Ranking table.
•	Export Data Tables as CSV/Excel: Each of the two data tables ('Dimensional Performance' and 'Sub-Unit Ranking') will have its own dedicated "Export Data" button, allowing users to download their specific datasets in CSV or XLSX format.

5.3.	Internal Reports for Federal Institutes
This module defines the internal, role-based reports for viewing and analyzing the informational data submitted by Federal Institutes. These reports are not public and are accessible only to authenticated users with the appropriate permissions.
5.3.1.	Report 1: Federal Institute Submissions Overview
This report provides a high-level, consolidated view of the submission status across all Federal Institutes for a given assessment cycle.
Property	Specification
Report Name	Federal Institute Submissions Overview
Report ID	INT-REPORT-FED-OVERVIEW-001
Report Type	Tabular Data Report / Dashboard
Target Audience	MInT Administrator, Central Committee Members, Chairman, Secretary. 
(Institute Administrators will see a scoped view showing only their own institute).

Filter Label	Field Name	Field Type	Options / Linked Doctype
Assessment Year	assessment_year	Select	(Dynamic list of years with data)
Submission Status	submission_status	Multi-Select	Draft, Pending Initial Approval, Pending Central Validation, Rejected, Validated

A. Data Table:A table that lists all Federal Institutes, providing a quick overview of their progress.
Column Label	Field Name	Field Type	Notes
Institute Name	unit_name	Link (to Report 2)	Name of the Federal Institute.
Submission Status	submission_status	Data	The current status of their submission.
Submission Date	submission_date	DateTime	Date it was first submitted for approval.
Last Updated	last_updated_date	DateTime	The last time the submission was modified.
Approved By	approver_name	Data	Name of the Institute Admin who approved it.

B. Functionality:
•	Ability to sort by any column.
•	An "Export to Excel/CSV" button to download the overview data.
C. Backend Logic:The script queries the Submissions table, filtering for units where UnitType is 'Federal Institute' and for the selected AssessmentYear. It joins user and unit data to populate the table. Access is restricted based on the user's role.

5.3.2.	Report 2: Federal Institute Detailed Submission View
This is a drill-down report showing the specific question-and-answer data submitted by a single Federal Institute.
Property	Specification
Report Name	Federal Institute Detailed Submission View
Report ID	INT-REPORT-FED-DETAIL-002
Report Type	Detailed Drill-Down Report
Target Audience	MInT Administrator, Central Committee Members, Chairman, Secretary. <br> (Scoped to the specific institute for Institute Administrators and Data Contributors).

Filter Label	Field Name	Field Type	Options / Linked Doctype
Assessment Year	assessment_year	Select	(Inherited from Report 3)
Institute Name	unit_name	Link	(Inherited from Report 3)

A. Report Layout:The report will display a clean, readable list of all questions applicable to the Federal Institute for that year.
•	Header Section: Displays the Institute Name, Submission Status, and key dates.
•	Question & Answer Section: A list organized by Assessment Dimension, showing:
•	Indicator/Question: The full text of the question.
•	Submitted Answer: The response provided by the Data Contributor (e.g., "Yes," selected options, or text).
•	Evidence: A clickable link to the provided evidence file or URL.
•	Central Committee Note: If a note was added during validation, it will be displayed here in a distinct, highlighted box.
B. Functionality:
•	A "Print to PDF" button to generate a clean, printable version of the full submission.
C. Backend Logic:The script receives a SubmissionID (or UnitID and AssessmentYearID). It queries the Responses table to retrieve all answers associated with that submission. It joins data from the Indicators, SubQuestions, and Users tables to display the full context for each answer, including any validation notes. Access is strictly scoped for institute-level users.
 
6.	Non-Functional Requirements
Table 4  Consolidated Non-Functional Requirements
Category	Requirement
Performance	The E-GIRS platform should load standard dashboard views and reports within 5 seconds under normal user load conditions.
	Data submission forms should load within 3 seconds, and data saving operations should complete within 5 seconds during peak usage.
Security	The system should implement encryption, access controls, and auditing to ensure data security and compliance.
	Role-Based Access Control (RBAC) must be enforced to restrict data access and system functionalities based on user permissions.
	An audit trail must be maintained for all significant data access, data modifications (submissions, approvals), and administrative actions.
	Data Encryption: All sensitive data must be encrypted both in transit and at rest.
Availability	The platform should maintain 99.5% uptime over a rolling 12-month period, excluding scheduled maintenance windows.
	E-GIRS should have failover mechanisms (e.g., redundant server instances, database replication) to ensure continued operation during hardware/software failures at the national datacenter.
Usability	The system must provide a user-friendly and intuitive interface for all user roles, including clear navigation and data entry forms.
	The E-GIRS should comply with WCAG 2.1 Level AA for accessibility.
	User-facing error messages must be clear, informative, and guide users towards resolution.
Scalability	The system should allow for horizontal scaling of web/application servers to handle increased user load.
Maintainability	The platform should follow a modular architecture, allowing independent updates and enhancements to components (e.g., UI, data collection, calculation engine, reporting).
	Source code must be well-documented and version controlled (e.g., using Git).
Compliance	E-GIRS must comply with relevant Ethiopian data protection regulations and MInT's data governance policies.
Portability	E-GIRS should be deployable on the designated national datacenter infrastructure (specific OS, database, and middleware to be confirmed by MInT).
Reliability	The system should have automated data validation checks at the point of input to minimize data entry errors and ensure data integrity.
	Continuous health checks should be implemented to detect and log system anomalies, with alerts for critical issues.
Auditability	All data modifications and access logs should be immutable and stored securely to support audit requirements.
	Authorized auditors (defined by MInT) should be able to access read-only audit logs securely.
Error Handling	The platform should have automated error handling and logging for system-level and application-level errors, with alerts sent to system administrators for critical failures.
Logging & Monitoring	Real-time monitoring of system performance (CPU, memory, disk, network), security events, and application health must be implemented.

 
7.	Other Requirements
This section outlines additional characteristics, deliverables, and services associated with the National eGov Index Reporting System (E-GIRS) and BI-enabled Dashboard. These elements complement the functional and non-functional requirements and are integral to the successful delivery and operation of the system.
7.1.	System Deliverables
The following key deliverables will be provided as part of the E-GIRS project. All documentation will be delivered in English, in approved digital formats (e.g., PDF, Word) and hard copies where specified.
1.	Project Management Documentation:
•	Project Plan: A comprehensive plan detailing objectives, scope, stakeholders, activities, detailed timeline, milestones, and deadlines.
•	Progress Reports: Regular status reports will be provided (weekly during active development, then bi-weekly; monthly and quarterly summaries) detailing activities completed, progress against milestones, risks, and issues.
2.	System Requirements Specification (SRS) Document: This document serves as the definitive specification for the E-GIRS, detailing its strategic context, overall description, functional requirements, non-functional requirements, and other relevant project parameters and deliverables.
3.	System Architecture and Design Documentation: Provides an architectural overview, including component diagrams, interaction models, hardware/software environment specifications, data flow diagrams, backend service design, deployment architecture, and scalability/performance design considerations.
4.	Database Design Document: Details the database schema, data models, and relationships for storing e-Government indexing data.
5.	Development and Deployment Documentation: Detailed instructions and procedures for deploying the E-GIRS into the production environment at the national datacenter.
6.	Technical Documentation: Comprehensive documentation of backend (server-side logic, internal APIs, database components) and frontend (user interface components, data entry, retrieval, visualization) development.
7.	Testing Documentation:
•	Test Plan: Details the overall testing strategy, scope, test scenarios, and criteria.
•	User Acceptance Testing (UAT) Support Plan & Report: Plan for supporting MInT during UAT, and a final UAT report summarizing outcomes.
•	System Test Reports: Reports from internal system testing phases.
8.	Software and Source Code:
•	Source Code: Complete, commented source code for all custom-developed components of the E-GIRS.
•	Compiled Executables/Deployment Package: All necessary files for deploying and running the E-GIRS.
•	Delivery of source code and reports will occur at least two weeks prior to project closure, provided in specified digital formats and hard copies.
9.	Training Materials and Program:
•	Training Materials: Comprehensive, original training materials covering system usage, administration (system and database), development environment, security, data analytics, report generation, system operations (including backup and recovery).
•	Training Program: Delivery of a 'training-the-trainers' program for MInT personnel, and other training sessions as agreed.
10.	Implementation Reports:
•	Inception Report: Initial report after project commencement.
•	Pilot Implementation Report: Findings and outcomes from any pilot deployment phase.
•	Full Deployment Report: Confirmation and details of the full system deployment.
•	User Feedback and Improvement Report (Post-Deployment): Summary of initial user feedback and any immediate improvements made.
•	Handover Report: A comprehensive document facilitating system handover to MInT, including operational procedures, lessons learned, and guidance for future maintenance and updates.
11.	Final Project Report:
•	A consolidated final report submitted after incorporation of MInT's feedback on the draft final report, summarizing the project execution, deliverables, and outcomes.
7.2.	Warranty and Support Services
The E-GIRS will be delivered with the following warranty and support services:
1.	Scope of Warranty Service: During the warranty period, services will include, at no additional cost:
•	Correction of software defects (bug fixing).
•	Performance tuning of the application.
•	Support for ensuring security of transactions, data storage, and application access.
•	User support related to the use of the portal.
•	Proactive identification and resolution of potential system issues and functional anomalies.
2.	Support Response Time: Critical issues will be responded to within 4 business hours and resolved within 12 business hours. Non-critical issues will be responded to within 1 business day with a resolution plan. 
3.	On-Site Support: On-site support will be provided as necessary to address critical bugs, errors, or user issues that cannot be resolved remotely during the warranty period.
4.	Development Tools Utilized: The system will be developed using common, widely adopted, and current technology development tools to ensure maintainability and supportability.
7.3.	Knowledge Transfer and Training Program
A comprehensive knowledge transfer and training program will be delivered to MInT personnel:
1.	Training Curriculum: The training will cover, at a minimum:
•	E-GIRS system architecture and development tools/languages used.
•	System administration (application and user management).
•	Database administration and management.
•	Data analytics features and data mapping logic.
•	Report generation and customization.
•	Understanding the E-GIRS assessment framework and index calculation logic.
2.	Training Approach: A 'training-the-trainers' model will be employed to empower MInT staff to conduct ongoing internal training.
3.	Data Handling and Management Approach (System Capabilities): The E-GIRS will incorporate the following capabilities related to data:
•	Data Collection Support: The system will provide tools and interfaces for data gathering. 
•	Database Management: The system will utilize a robust and scalable database designed for efficient storage, retrieval, and management of e-government index data and associated metadata.
•	Data Analysis and Indexing Engine: The system will feature an engine to perform statistical analysis, apply defined weightings, and calculate index scores based on the approved methodology.
•	Data Visualization Tools: The BI-enabled dashboard will utilize appropriate tools to present index findings effectively.
7.4.	Deployment
•	Deployment Environment: The E-GIRS will be deployed to the national datacenter, on infrastructure meeting the system's specified hardware and software requirements.
 


Approvals and Authorizations

Company  	Name & Role	Signature /Stamp	Date
Eldix IT Technology PLC (360Ground)			
Ministry of Innovation and Technology (MInT)
			


