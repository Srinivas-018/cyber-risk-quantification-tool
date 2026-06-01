package com.internship.tool.config;

import com.internship.tool.entity.Asset;
import com.internship.tool.repository.AssetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final AssetRepository assetRepository;

    public DataLoader(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (assetRepository.countActiveAssets() == 0) {
            seedAssets();
        }
    }

    private void seedAssets() {
        List<Asset> assets = new ArrayList<>();

        // 1-5 Critical Assets
        assets.add(createAsset("Financial Database", "Database", "Core Postgres DB hosting customer payment details.", "Critical", 9, "Unpatched SQL injection vulnerability, Unencrypted PII tables", "High financial loss and compliance penalties."));
        assets.add(createAsset("Domain Controller", "Server", "Active Directory Server managing corporate access.", "Critical", 10, "Outdated OS version, Kerberoasting vulnerability", "Total network compromise and identity theft."));
        assets.add(createAsset("Internal HR Portal", "Application", "Employee data repository storing SSN and personal info.", "Critical", 9, "Broken object-level authorization, Weak session management", "Major data leak and privacy violations."));
        assets.add(createAsset("VPN Gateway", "Network", "Remote access endpoint for remote workforce.", "Critical", 9, "RCE vulnerability in VPN firmware, Single-factor authentication enabled", "Uncontrolled network entry by malicious actors."));
        assets.add(createAsset("Customer CRM", "Application", "Salesforce instance storing all client communication logs.", "Critical", 9, "Lack of rate limiting, Exposed API keys", "Intellectual property theft and customer data leak."));

        // 6-15 High Assets
        assets.add(createAsset("Public API Gateway", "Application", "Exposes API endpoints to vendor systems.", "High", 8, "Outdated SSL/TLS cipher suites, Improper error handling", "Interception of credentials via man-in-the-middle attacks."));
        assets.add(createAsset("E-Commerce Web Server", "Server", "Customer facing application server hosting online catalog.", "High", 8, "Cross-site scripting (XSS), Outdated Apache version", "Defacement and session hijacking of users."));
        assets.add(createAsset("DevOps CI/CD runner", "Application", "Server executing build pipelines and code deployment.", "High", 7, "Excessive system privileges, Insecure environment variables", "Code tampering and pipeline poisoning."));
        assets.add(createAsset("Primary Firewall", "Network", "Edge router blocking malicious internet traffic.", "High", 8, "Weak admin credentials, Disabled audit logs", "Security bypass and undetected breach of perimeter."));
        assets.add(createAsset("Mail Server", "Server", "Corporate SMTP exchange server.", "High", 7, "Open relay misconfiguration, Outdated SPAM filters", "E-mail phishing campaigns using corporate domain."));
        assets.add(createAsset("Backup NAS", "Database", "Local storage storing daily system state snapshots.", "High", 8, "Cleartext storage transmission, Inadequate ACLs", "Ransomware encryption of system recovery snapshots."));
        assets.add(createAsset("CEO Laptop", "Endpoint", "Windows workstation used by Chief Executive.", "High", 8, "Antivirus disabled, Unpatched PDF reader utility", "Data theft of trade secrets and spear phishing target."));
        assets.add(createAsset("Kubernetes Control Plane", "Server", "Coordinates cluster tasks and resource deployments.", "High", 8, "Anonymous authentication enabled, Public dashboard access", "Unauthorized container deployments and cryptojacking."));
        assets.add(createAsset("Marketing CMS", "Application", "WordPress site hosting company news and press releases.", "High", 7, "Vulnerable third-party plugins, Exposed admin portal", "Site defacement and malicious software hosting."));
        assets.add(createAsset("Customer Support DB", "Database", "Relational database logging tickets and queries.", "High", 7, "Lack of transport encryption, Permissive connection pool configuration", "Exposure of custom communications and customer accounts."));

        // 16-25 Medium Assets
        assets.add(createAsset("Office WiFi Router", "Network", "Wireless network for corporate office workers.", "Medium", 6, "WEP/WPA security encryption, Common SSID password key", "Eavesdropping on internal corporate traffic."));
        assets.add(createAsset("CFO Workstation", "Endpoint", "MacBook Pro used for financial reconciliation.", "Medium", 5, "Personal software installed, Disabled firewall", "Malware entry point and local credential theft."));
        assets.add(createAsset("Internal JIRA Server", "Application", "Ticketing system for developer tasks and logs.", "Medium", 6, "Missing security updates, Permissive group memberships", "Exfiltration of system design and bug logs."));
        assets.add(createAsset("File Share Server", "Server", "Samba share for document templates.", "Medium", 5, "Outdated SMBv1 protocol enabled, Missing access logs", "Lateral movement vector inside local area network."));
        assets.add(createAsset("Dev DB Instance", "Database", "MongoDB instance containing synthetic test records.", "Medium", 5, "Default port exposed, Missing root password", "Data destruction and development service interruption."));
        assets.add(createAsset("Employee Laptops", "Endpoint", "Standard workstations for marketing and sales staffs.", "Medium", 6, "Missing security agents, Local administrator rights", "Infection by trojan horses and ransomware spread."));
        assets.add(createAsset("Log Aggregator", "Server", "Splunk host collecting local machine debug events.", "Medium", 5, "Exposed port bindings, Cleartext transmission", "Tampering of system history records."));
        assets.add(createAsset("Print Server", "Server", "Manages printer jobs inside local network office.", "Medium", 4, "Outdated printer driver software, Insecure remote console", "Denial of service and local buffer overflow vulnerabilities."));
        assets.add(createAsset("Analytics Engine", "Application", "Python dashboard rendering user behavior stats.", "Medium", 5, "Vulnerable packaging libraries, Exposed debug flags", "Unauthorized code execution inside sandbox container."));
        assets.add(createAsset("Staging Portal", "Application", "Pre-production mirror of the e-commerce app.", "Medium", 6, "Exposed debug console, Insecure SSL setup", "Leakage of next-generation release features."));

        // 26-30 Low Assets
        assets.add(createAsset("Office Printer", "Endpoint", "Smart office scanner and printing hardware.", "Low", 3, "Exposed Telnet terminal port, Outdated firmware", "Denial of service attacks by local network actors."));
        assets.add(createAsset("Guest Access Router", "Network", "Isolated network segment for office visitors.", "Low", 3, "Missing DNS filters, Weak access password", "Bandwidth exhaustion and user tracking."));
        assets.add(createAsset("Reception PC", "Endpoint", "Front-desk computer showing visitor log records.", "Low", 2, "Disabled screen timeout lock, Basic security agents", "Unauthorized view of visitor names by walk-in users."));
        assets.add(createAsset("Digital Signage Board", "Endpoint", "Monitor in lobby displaying company statistics.", "Low", 1, "Exposed administration password, Default settings", "Display of inappropriate content by local attackers."));
        assets.add(createAsset("Dev Sandbox Server", "Server", "Virtual sandbox for experimental configurations.", "Low", 2, "Permissive firewall configuration, Basic packages", "Resource abuse and local computing exhaustion."));

        assetRepository.saveAll(assets);
    }

    private Asset createAsset(String name, String type, String desc, String riskLevel, int score, String vulns, String impact) {
        Asset asset = new Asset();
        asset.setAssetName(name);
        asset.setAssetType(type);
        asset.setDescription(desc);
        asset.setRiskLevel(riskLevel);
        asset.setRiskScore(score);
        asset.setVulnerabilities(vulns);
        asset.setImpact(impact);
        return asset;
    }
}
