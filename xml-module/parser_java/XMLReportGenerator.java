package com.smartcampus.xml;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import java.io.StringWriter;
import java.time.LocalDateTime;

/**
 * Smart Campus Connect - Java XML Report Generator
 * Syllabus: Unit 5 (XML Generation using Java DOM API)
 */
public class XMLReportGenerator {

    public static String generateReport() throws Exception {
        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

        Document doc = docBuilder.newDocument();

        // Root element
        Element rootElement = doc.createElement("CampusAcademicReport");
        rootElement.setAttribute("version", "1.0");
        doc.appendChild(rootElement);

        // Institution
        Element institution = doc.createElement("Institution");
        institution.setTextContent("Smart Campus Institute of Technology");
        rootElement.appendChild(institution);

        // Generated Date
        Element genDate = doc.createElement("GeneratedDate");
        genDate.setTextContent(LocalDateTime.now().toString());
        rootElement.appendChild(genDate);

        // Students container
        Element students = doc.createElement("Students");
        rootElement.appendChild(students);

        // Student 1
        Element student1 = doc.createElement("Student");
        student1.setAttribute("id", "1");

        Element roll1 = doc.createElement("RollNumber");
        roll1.setTextContent("CS2023-001");
        student1.appendChild(roll1);

        Element name1 = doc.createElement("FullName");
        name1.setTextContent("Rahul Verma");
        student1.appendChild(name1);

        Element dept1 = doc.createElement("Department");
        dept1.setTextContent("Computer Science & Engineering");
        student1.appendChild(dept1);

        Element cgpa1 = doc.createElement("CGPA");
        cgpa1.setTextContent("8.85");
        student1.appendChild(cgpa1);

        Element attSum1 = doc.createElement("AttendanceSummary");
        Element totalCls = doc.createElement("TotalClasses");
        totalCls.setTextContent("24");
        attSum1.appendChild(totalCls);

        Element attCls = doc.createElement("AttendedClasses");
        attCls.setTextContent("21");
        attSum1.appendChild(attCls);

        Element pct = doc.createElement("Percentage");
        pct.setTextContent("87.5");
        attSum1.appendChild(pct);

        Element elig = doc.createElement("EligibilityStatus");
        elig.setTextContent("Eligible");
        attSum1.appendChild(elig);

        student1.appendChild(attSum1);
        students.appendChild(student1);

        // Transform DOM to XML String
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");

        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.toString();
    }

    public static void main(String[] args) {
        try {
            System.out.println("=== Generating Campus XML Report using Java DOM ===");
            String xml = generateReport();
            System.out.println(xml);
            System.out.println("=== XML Generation Completed Successfully ===");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
