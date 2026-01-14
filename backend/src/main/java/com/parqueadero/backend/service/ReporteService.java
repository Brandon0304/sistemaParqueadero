package com.parqueadero.backend.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.parqueadero.dto.TicketFiltroRequest;
import com.parqueadero.model.Ticket;
import com.parqueadero.repository.TicketRepository;
import com.parqueadero.specification.TicketSpecification;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final TicketRepository ticketRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Genera un archivo Excel con los tickets filtrados
     */
    public byte[] generarReporteExcel(TicketFiltroRequest filtro) throws IOException {
        // Obtener tickets con filtros
        List<Ticket> tickets = obtenerTicketsFiltrados(filtro);

        // Crear workbook
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Tickets");

            // Estilos
            CellStyle headerStyle = crearEstiloHeader(workbook);
            CellStyle dataStyle = crearEstiloData(workbook);
            CellStyle moneyStyle = crearEstiloMoney(workbook);

            // Crear header
            Row headerRow = sheet.createRow(0);
            String[] columnas = {"Código", "Placa", "Tipo Vehículo", "Entrada", "Salida", "Estado", "Monto Total"};
            
            for (int i = 0; i < columnas.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }

            // Llenar datos
            int rowNum = 1;
            for (Ticket ticket : tickets) {
                Row row = sheet.createRow(rowNum++);

                org.apache.poi.ss.usermodel.Cell cell0 = row.createCell(0);
                cell0.setCellValue(ticket.getCodigo());
                cell0.setCellStyle(dataStyle);

                org.apache.poi.ss.usermodel.Cell cell1 = row.createCell(1);
                cell1.setCellValue(ticket.getVehiculo().getPlaca());
                cell1.setCellStyle(dataStyle);

                org.apache.poi.ss.usermodel.Cell cell2 = row.createCell(2);
                cell2.setCellValue(ticket.getVehiculo().getTipo().name());
                cell2.setCellStyle(dataStyle);

                org.apache.poi.ss.usermodel.Cell cell3 = row.createCell(3);
                cell3.setCellValue(ticket.getFechaHoraEntrada().format(DATE_FORMATTER));
                cell3.setCellStyle(dataStyle);

                org.apache.poi.ss.usermodel.Cell cell4 = row.createCell(4);
                cell4.setCellValue(ticket.getFechaHoraSalida() != null ? 
                    ticket.getFechaHoraSalida().format(DATE_FORMATTER) : "");
                cell4.setCellStyle(dataStyle);

                org.apache.poi.ss.usermodel.Cell cell5 = row.createCell(5);
                cell5.setCellValue(ticket.getEstado().name());
                cell5.setCellStyle(dataStyle);

                org.apache.poi.ss.usermodel.Cell cell6 = row.createCell(6);
                cell6.setCellValue(ticket.getMontoTotal() != null ? 
                    ticket.getMontoTotal().doubleValue() : 0.0);
                cell6.setCellStyle(moneyStyle);
            }

            // Auto-ajustar columnas
            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Genera un archivo PDF con los tickets filtrados
     */
    public byte[] generarReportePDF(TicketFiltroRequest filtro) throws IOException {
        // Obtener tickets con filtros
        List<Ticket> tickets = obtenerTicketsFiltrados(filtro);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Título
            Paragraph title = new Paragraph("Reporte de Tickets")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            // Fecha de generación
            Paragraph fecha = new Paragraph("Generado el: " + 
                    java.time.LocalDateTime.now().format(DATE_FORMATTER))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(fecha);

            // Crear tabla
            float[] columnWidths = {1.5f, 1.5f, 1.2f, 2f, 2f, 1.2f, 1.5f};
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Headers
            String[] headers = {"Código", "Placa", "Tipo", "Entrada", "Salida", "Estado", "Monto"};
            for (String header : headers) {
                com.itextpdf.layout.element.Cell cell = new com.itextpdf.layout.element.Cell()
                        .add(new Paragraph(header).setBold())
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addHeaderCell(cell);
            }

            // Datos
            for (Ticket ticket : tickets) {
                table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(ticket.getCodigo()).setFontSize(9)));
                table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(ticket.getVehiculo().getPlaca()).setFontSize(9)));
                table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(ticket.getVehiculo().getTipo().name()).setFontSize(9)));
                table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(ticket.getFechaHoraEntrada().format(DATE_FORMATTER)).setFontSize(9)));
                table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(
                    ticket.getFechaHoraSalida() != null ? ticket.getFechaHoraSalida().format(DATE_FORMATTER) : "-"
                ).setFontSize(9)));
                table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(ticket.getEstado().name()).setFontSize(9)));
                table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(
                    ticket.getMontoTotal() != null ? "$" + ticket.getMontoTotal().toString() : "-"
                ).setFontSize(9)).setTextAlignment(TextAlignment.RIGHT));
            }

            document.add(table);

            // Resumen
            double total = tickets.stream()
                    .filter(t -> t.getMontoTotal() != null)
                    .mapToDouble(t -> t.getMontoTotal().doubleValue())
                    .sum();

            Paragraph resumen = new Paragraph("\nTotal de tickets: " + tickets.size() + 
                    " | Total recaudado: $" + String.format("%.2f", total))
                    .setFontSize(12)
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(20);
            document.add(resumen);

            document.close();
            return outputStream.toByteArray();
        }
    }

    /**
     * Obtiene tickets aplicando filtros
     */
    private List<Ticket> obtenerTicketsFiltrados(TicketFiltroRequest filtro) {
        if (filtro == null) {
            return ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaHoraEntrada"));
        }

        return ticketRepository.findAll(
                TicketSpecification.conFiltros(filtro),
                Sort.by(Sort.Direction.DESC, "fechaHoraEntrada")
        );
    }

    // Métodos auxiliares para estilos Excel
    private CellStyle crearEstiloHeader(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloData(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloMoney(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
}
