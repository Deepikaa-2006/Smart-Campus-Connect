package com.smartcampus.xml;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import java.io.File;

/**
 * Smart Campus Connect - Java XML Feed Parser
 * Syllabus: Unit 5 (XML Parsing using Java DOM API)
 */
public class XMLFeedParser {

    public static void parseEventsXML(String filePath) throws Exception {
        File xmlFile = new File(filePath);
        if (!xmlFile.exists()) {
            System.err.println("File not found: " + filePath);
            return;
        }

        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.parse(xmlFile);
        doc.getDocumentElement().normalize();

        System.out.println("Root Element: " + doc.getDocumentElement().getNodeName());
        System.out.println("College: " + doc.getElementsByTagName("CollegeName").item(0).getTextContent());
        System.out.println("Academic Year: " + doc.getElementsByTagName("AcademicYear").item(0).getTextContent());
        System.out.println("--------------------------------------------------");

        NodeList nList = doc.getElementsByTagName("Event");
        for (int temp = 0; temp < nList.getLength(); temp++) {
            Node nNode = nList.item(temp);
            if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                Element e = (Element) nNode;
                System.out.println("Event ID: " + e.getAttribute("id") + " [" + e.getAttribute("status") + "]");
                System.out.println("Title: " + e.getElementsByTagName("Title").item(0).getTextContent());
                System.out.println("Category: " + e.getElementsByTagName("Category").item(0).getTextContent());
                System.out.println("Date: " + e.getElementsByTagName("EventDate").item(0).getTextContent());
                System.out.println("Location: " + e.getElementsByTagName("Location").item(0).getTextContent());
                System.out.println("Capacity: " + e.getElementsByTagName("MaxCapacity").item(0).getTextContent());
                System.out.println("--------------------------------------------------");
            }
        }
    }

    public static void main(String[] args) {
        try {
            String path = args.length > 0 ? args[0] : "xml-module/data/sample_events.xml";
            System.out.println("=== Parsing Events XML with Java DOM Parser ===");
            parseEventsXML(path);
            System.out.println("=== XML Parsing Completed Successfully ===");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
