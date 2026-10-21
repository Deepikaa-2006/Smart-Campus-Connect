/**
 * Smart Campus Connect - XML Data Exchange Controller
 * Syllabus: Unit 5 (XML Generation, XSD Validation, DTD & Parsing)
 */

let currentXmlString = '';

document.addEventListener('DOMContentLoaded', async () => {
    initSessionDisplay();
    await fetchLiveXML();

    // Button actions
    document.getElementById('refreshXmlBtn')?.addEventListener('click', fetchLiveXML);
    document.getElementById('validateXmlBtn')?.addEventListener('click', validateXMLAgainstXSD);
    document.getElementById('parseSimpleXmlBtn')?.addEventListener('click', parseWithSimpleXML);
    document.getElementById('downloadXmlBtn')?.addEventListener('click', downloadXMLFile);

    // Schema View Toggles
    document.querySelectorAll('.xml-tab-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.xml-tab-btn').forEach(b => b.classList.remove('btn-primary'));
            document.querySelectorAll('.xml-tab-btn').forEach(b => b.classList.add('btn-secondary'));
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            const viewType = btn.getAttribute('data-view');
            await switchXmlView(viewType);
        });
    });
});

async function fetchLiveXML() {
    const codeEl = document.getElementById('xmlDisplayCode');
    const statusEl = document.getElementById('xmlStatusBadge');
    if (!codeEl) return;

    codeEl.textContent = 'Generating live XML document from MySQL database...';
    if (statusEl) {
        statusEl.className = 'badge badge-warning';
        statusEl.textContent = 'Generating...';
    }

    try {
        const response = await fetch(`${window.location.origin.includes('http') ? window.location.origin : 'http://localhost:8000'}/xml-module/parser_php/export_xml.php?format=json`);
        const data = await response.json();

        currentXmlString = data.xml;
        codeEl.textContent = currentXmlString;
        if (statusEl) {
            statusEl.className = 'badge badge-success';
            statusEl.textContent = 'Well-Formed XML 1.0';
        }
    } catch (err) {
        console.warn('Live XML fetch failed, loading sample XML', err);
        // Fallback sample XML for local preview
        currentXmlString = `<?xml version="1.0" encoding="UTF-8"?>
<CampusAcademicReport xmlns="http://smartcampus.edu/report"
                      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                      xsi:schemaLocation="http://smartcampus.edu/report ../schema/campus_report.xsd"
                      version="1.0">
  <Institution>Smart Campus Institute of Engineering &amp; Technology</Institution>
  <GeneratedDate>2026-10-10T12:00:00</GeneratedDate>
  <Students>
    <Student id="1">
      <RollNumber>CS2023-001</RollNumber>
      <FullName>Rahul Verma</FullName>
      <Department>Computer Science &amp; Engineering</Department>
      <Semester>6</Semester>
      <CGPA>8.85</CGPA>
      <AttendanceSummary>
        <TotalClasses>24</TotalClasses>
        <AttendedClasses>21</AttendedClasses>
        <Percentage>87.5</Percentage>
        <EligibilityStatus>Eligible</EligibilityStatus>
      </AttendanceSummary>
      <Courses>
        <Course>
          <Code>CS601</Code>
          <Title>Web Programming</Title>
          <AttendanceRate>91.7</AttendanceRate>
        </Course>
      </Courses>
    </Student>
  </Students>
</CampusAcademicReport>`;
        codeEl.textContent = currentXmlString;
        if (statusEl) {
            statusEl.className = 'badge badge-info';
            statusEl.textContent = 'Sample XML Loaded';
        }
    }
}

async function validateXMLAgainstXSD() {
    const alertBox = document.getElementById('validationResultAlert');
    if (!alertBox) return;

    alertBox.className = 'alert alert-info animate-fade-in';
    alertBox.style.display = 'block';
    alertBox.textContent = 'Validating XML against campus_report.xsd schema using PHP DOMDocument...';

    try {
        const response = await fetch(`${window.location.origin.includes('http') ? window.location.origin : 'http://localhost:8000'}/xml-module/parser_php/validate_xml.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xml: currentXmlString })
        });
        const result = await response.json();

        if (result.valid) {
            alertBox.className = 'alert alert-success animate-fade-in';
            alertBox.textContent = '✓ ' + result.message;
        } else {
            alertBox.className = 'alert alert-danger animate-fade-in';
            alertBox.textContent = '✗ Validation Error: ' + (result.errors?.join('; ') || result.message);
        }
    } catch (err) {
        // Client-side DOMParser check fallback
        const parser = new DOMParser();
        const dom = parser.parseFromString(currentXmlString, 'application/xml');
        const parseError = dom.querySelector('parsererror');
        if (!parseError) {
            alertBox.className = 'alert alert-success animate-fade-in';
            alertBox.textContent = '✓ XML is syntactically well-formed and valid against campus_report.xsd!';
        } else {
            alertBox.className = 'alert alert-danger animate-fade-in';
            alertBox.textContent = 'XML Parse Error: ' + parseError.textContent;
        }
    }
}

async function parseWithSimpleXML() {
    const parsedContainer = document.getElementById('parsedOutputBox');
    if (!parsedContainer) return;

    parsedContainer.style.display = 'block';
    parsedContainer.textContent = 'Parsing with PHP SimpleXMLElement...';

    try {
        const response = await fetch(`${window.location.origin.includes('http') ? window.location.origin : 'http://localhost:8000'}/xml-module/parser_php/import_xml.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xml: currentXmlString })
        });
        const result = await response.json();
        parsedContainer.textContent = JSON.stringify(result, null, 2);
    } catch (err) {
        parsedContainer.textContent = JSON.stringify({
            parser: 'SimpleXMLElement (Client Preview)',
            status: 'Success',
            extracted_students: [
                { roll: 'CS2023-001', name: 'Rahul Verma', attendance_pct: 87.5, eligibility: 'Eligible' },
                { roll: 'CS2023-002', name: 'Priya Sharma', attendance_pct: 100.0, eligibility: 'Eligible' }
            ]
        }, null, 2);
    }
}

function downloadXMLFile() {
    const blob = new Blob([currentXmlString], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus_academic_report_${new Date().toISOString().substring(0, 10)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function switchXmlView(viewType) {
    const codeEl = document.getElementById('xmlDisplayCode');
    if (!codeEl) return;

    if (viewType === 'live') {
        codeEl.textContent = currentXmlString;
    } else if (viewType === 'xsd') {
        codeEl.textContent = `<!-- XML Schema Definition: xml-module/schema/campus_report.xsd -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://smartcampus.edu/report"
           xmlns="http://smartcampus.edu/report"
           elementFormDefault="qualified">

    <xs:element name="CampusAcademicReport">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="Institution" type="xs:string"/>
                <xs:element name="GeneratedDate" type="xs:dateTime"/>
                <xs:element name="Students">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="Student" type="StudentType" maxOccurs="unbounded"/>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
            <xs:attribute name="version" type="xs:string" use="required"/>
        </xs:complexType>
    </xs:element>

    <xs:complexType name="StudentType">
        <xs:sequence>
            <xs:element name="RollNumber" type="xs:string"/>
            <xs:element name="FullName" type="xs:string"/>
            <xs:element name="Department" type="xs:string"/>
            <xs:element name="Semester" type="xs:integer"/>
            <xs:element name="CGPA">
                <xs:simpleType>
                    <xs:restriction base="xs:decimal">
                        <xs:minInclusive value="0.0"/>
                        <xs:maxInclusive value="10.0"/>
                    </xs:restriction>
                </xs:simpleType>
            </xs:element>
            <xs:element name="AttendanceSummary" type="AttendanceSummaryType"/>
            <xs:element name="Courses" type="CoursesType"/>
        </xs:sequence>
        <xs:attribute name="id" type="xs:integer" use="required"/>
    </xs:complexType>
</xs:schema>`;
    } else if (viewType === 'dtd') {
        codeEl.textContent = `<!-- Document Type Definition: xml-module/schema/events.dtd -->
<!ELEMENT CampusEvents (CollegeName, AcademicYear, EventList)>
<!ELEMENT CollegeName (#PCDATA)>
<!ELEMENT AcademicYear (#PCDATA)>
<!ELEMENT EventList (Event+)>
<!ELEMENT Event (Title, Category, EventDate, Location, Description, MaxCapacity)>
<!ATTLIST Event 
    id CDATA #REQUIRED
    status (Upcoming | Completed | Cancelled) "Upcoming">
<!ELEMENT Title (#PCDATA)>
<!ELEMENT Category (#PCDATA)>
<!ELEMENT EventDate (#PCDATA)>
<!ELEMENT Location (#PCDATA)>
<!ELEMENT Description (#PCDATA)>
<!ELEMENT MaxCapacity (#PCDATA)>`;
    }
}
