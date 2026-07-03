package com.gplsp.service;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JREmptyDataSource;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

@Service
public class ReportS {

    private final DataSource dataSource;
    private final TemplateSettingsS templateSettingsS;

    public ReportS(DataSource dataSource, TemplateSettingsS templateSettingsS) {
        this.dataSource = dataSource;
        this.templateSettingsS = templateSettingsS;
    }

    public byte[] generatePdf(String reportName, Map<String, Object> params) {
        ClassPathResource jrxmlResource = new ClassPathResource("reports/" + reportName + ".jrxml");
        ClassPathResource jasperResource = new ClassPathResource("reports/" + reportName + ".jasper");

        if (!jrxmlResource.exists() && !jasperResource.exists()) {
            throw new IllegalArgumentException("Report not found: " + reportName);
        }

        try {
            JasperReport report = loadReport(jrxmlResource, jasperResource);
            JasperPrint jasperPrint = fillReport(report, params);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (SQLException | JRException | IOException e) {
            throw new RuntimeException("Failed to generate report: " + reportName, e);
        }
    }

    public byte[] generatePdfForDocumentType(String username, String documentTypeCode, Map<String, Object> params) {
        String reportName = templateSettingsS.resolveReportNameForUser(username, documentTypeCode);
        return generatePdf(reportName, params);
    }

    private JasperReport loadReport(ClassPathResource jrxmlResource, ClassPathResource jasperResource)
            throws IOException, JRException {
        if (jrxmlResource.exists()) {
            try (InputStream jrxmlStream = jrxmlResource.getInputStream()) {
                return JasperCompileManager.compileReport(jrxmlStream);
            }
        }

        try (InputStream jasperStream = jasperResource.getInputStream()) {
            return (JasperReport) net.sf.jasperreports.engine.util.JRLoader.loadObject(jasperStream);
        }
    }

    private JasperPrint fillReport(JasperReport report, Map<String, Object> params) throws SQLException, JRException {
        boolean hasQuery = report.getQuery() != null
                && report.getQuery().getText() != null
                && !report.getQuery().getText().trim().isEmpty();

        if (!hasQuery) {
            return JasperFillManager.fillReport(report, params, new JREmptyDataSource());
        }

        try (Connection connection = dataSource.getConnection()) {
            return JasperFillManager.fillReport(report, params, connection);
        }
    }
}
