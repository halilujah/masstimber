Project: Mass Timber Suite – Phase 1
Company: TimbA Systems Ltd
Type: Web-Based SaaS Platform
Region: Europe (Eurocode-based simplified logic)
________________________________________
1️⃣ PROJECT OVERVIEW
Mass Timber Suite is a web-based concept-to-cost platform specialized in mass timber buildings.
The software allows users (engineers, architects, developers) to:
Model a timber building (controlled parametric 3D)
Define Eurocode-based loads (simplified)
Perform preliminary structural validation
Optimize CLT and glulam sizes from defined libraries
Estimate connection quantities
Generate detailed cost breakdown (€/m² and €/m³)
Export professional PDF and Excel reports
Phase 1 is NOT:
A BIM authoring tool
A full FEM solver
A code-compliance certification software
It is a cost-driven concept design tool with simplified structural validation.
________________________________________
2️⃣ TARGET USERS
Structural Engineers (preliminary sizing, offers)
Architects (feasibility studies)
Developers / Investors (cost forecasting)
The UX must support both:
Feasibility Mode (simple, cost-focused)
Engineer Mode (detailed structural view)
________________________________________
3️⃣ TECHNOLOGY STACK REQUIREMENTS
Frontend:
React
Three.js for 3D visualization
Backend:
Python (FastAPI)
NumPy (calculation engine)
Modular architecture (calculation layer separated from UI)
Database:
PostgreSQL
Structured data tables for:
Projects
Manufacturer libraries
Material properties
Cost libraries
Authentication & Subscription:
Stripe integration
Role-based access control
Architecture must allow future integration of:
C++ FEM microservice
Advanced structural engine (Phase 2)
Calculation engine must be modular and independent from frontend.
________________________________________
4️⃣ PHASE 1 SYSTEM MODULES
________________________________________
4.1 Geometry & Modeling Module
Controlled parametric modeling (not free-form BIM).
User capabilities:
Draw orthogonal walls in plan view
Define wall thickness
Add rectangular openings
Define story heights (max 4 stories)
Select roof type:
Flat
Mono-pitch
Gable
System automatically:
Generates slabs per story
Extrudes walls to 3D
Splits structural elements by level
Creates internal structural model
Constraints:
Orthogonal walls only
No curved geometry
No arbitrary 3D push/pull
________________________________________
4.2 Load Definition Module
User inputs:
Dead load (additional permanent load)
Live load category (EN 1991-1-1)
Wind zone (simplified selection)
Terrain category
Seismic zone (optional, equivalent static only)
Soil type
System applies:
EN 1990 load combinations (fixed simplified values)
EN 1991 vertical loads
Simplified wind calculation
EN 1998 equivalent static method (if enabled)
National annex selection excluded in Phase 1.
________________________________________
4.3 Preliminary Structural Validation Module
Purpose: Provide engineering confidence, not full compliance.
Checks include:
Vertical:
Slab bending and deflection (EC5 simplified)
Beam bending and deflection
Column axial compression
Wall shear and compression simplified
Lateral:
Base shear calculation
Story force distribution
Drift estimation
Drift limit check
Output:
Utilization ratios (%)
Pass / Warning indicators
All formulas to be provided separately in structural logic document.
________________________________________
4.4 Optimization Engine
Discrete library-based optimization.
CLT Optimization
Inputs:
Span
Load
Support condition
Process:
Loop through available thickness options
Perform capacity checks
Filter passing options
Rank by:
Minimum thickness
Minimum cost
Minimum weight
Output:
Selected optimal CLT thickness
________________________________________
Glulam Optimization
Process:
Loop through available standard section sizes
Perform bending and deflection checks
Select optimal section
Optimization must be rule-based and deterministic.
No advanced mathematical optimization required.
________________________________________
4.5 Manufacturer Library Module
Admin interface required.
Admin must be able to:
Add manufacturer
Define CLT panel sizes
Define thicknesses
Define mechanical properties
Define standard widths
Define costs
Define glulam section libraries
User can select:
“Use Manufacturer X”
Optimization engine must use selected library.
Data structure must support multiple manufacturers.
________________________________________
4.6 Connection Estimation Module
Simplified estimation logic based on:
Shear demand
Tributary wall length
Empirical fastener density factors
Outputs:
Estimated screw count
Estimated connector quantity
Estimated hardware cost
No nonlinear modeling required.
________________________________________
4.7 Cost Engine
Inputs:
Unit cost per m³
Unit cost per m²
Connection cost
Installation factor %
Waste factor %
Outputs:
CLT cost
Glulam cost
Connection cost
Total structural cost
Cost per m²
Cost per m³
Breakdown chart
Cost results are primary UI focus.
________________________________________
4.8 Reporting Module
Export:
PDF must include:
Project summary
3D building snapshots
Structural sizes
Utilization %
Quantities
Cost breakdown
Excel export must include:
Quantity table
Cost calculations
Load summary
Reports must be clean and professional.
________________________________________
5️⃣ USER INTERFACE MODES
Feasibility Mode (default):
Clean UI
Cost per m² prominent
Basic structural summary
3D visualization
Engineer Mode:
Detailed load combinations
Utilization ratios
Structural parameters
Editable cost libraries
Same backend logic, different visibility.
________________________________________
6️⃣ DELIVERABLES
Developer must deliver:
Fully functional web application
Modular backend calculation engine
Optimization engine
Manufacturer library system
Cost engine
3D visualization
PDF export
Excel export
Stripe subscription integration
Source code repository
Basic technical documentation
________________________________________
7️⃣ FUTURE EXPANSION REQUIREMENT
Code must be structured so that:
FEM solver can be added as separate service
Structural calculation module can be extended
Manufacturer libraries can scale
API integration possible
Frontend should not require rewriting when adding FEM.
________________________________________
8️⃣ SUCCESS CRITERIA (PHASE 1)
Software is successful if a user can:
Model a 4-story timber building
Define loads
Automatically size CLT and glulam
View utilization %
Get optimized section selection
See full cost breakdown
Export professional report
Subscribe via SaaS
All within a clean, stable interface.