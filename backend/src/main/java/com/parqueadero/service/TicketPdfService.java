package com.parqueadero.service;

import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.barcodes.qrcode.EncodeHintType;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.parqueadero.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Servicio para generar el TICKET de ENTRADA con QR
 * Este ticket se entrega al cliente cuando INGRESA el vehículo
 */
@Service
@RequiredArgsConstructor
public class TicketPdfService {

    /**
     * Genera el PDF del ticket de ENTRADA
     * Contiene: código QR con el código del ticket, datos del vehículo, fecha/hora entrada
     */
    public byte[] generarTicketEntrada(Ticket ticket) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A6); // Tamaño pequeño para ticket
        
        // ===== TÍTULO =====
        Paragraph titulo = new Paragraph("TICKET DE ENTRADA")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(titulo);
        
        // ===== CÓDIGO QR CON EL CÓDIGO DEL TICKET =====
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        BarcodeQRCode qrCode = new BarcodeQRCode(ticket.getCodigo(), hints);
        PdfFormXObject qrObject = qrCode.createFormXObject(ColorConstants.BLACK, pdfDoc);
        Image qrImage = new Image(qrObject).setWidth(150).setHeight(150);
        qrImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
        qrImage.setMarginBottom(10);
        document.add(qrImage);
        
        // ===== CÓDIGO DEL TICKET (texto) =====
        Paragraph codigo = new Paragraph(ticket.getCodigo())
                .setFontSize(12)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15);
        document.add(codigo);
        
        // ===== INFORMACIÓN DEL VEHÍCULO =====
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .useAllAvailableWidth()
                .setMarginBottom(10);
        
        addTableRow(table, "Placa:", ticket.getVehiculo().getPlaca());
        addTableRow(table, "Tipo Vehículo:", ticket.getVehiculo().getTipo().toString());
        addTableRow(table, "Fecha Entrada:", 
            ticket.getFechaHoraEntrada().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        addTableRow(table, "Hora Entrada:", 
            ticket.getFechaHoraEntrada().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        addTableRow(table, "Operador:", ticket.getUsuarioEntrada().getUsername());
        
        document.add(table);
        
        // ===== INSTRUCCIONES =====
        Paragraph instrucciones = new Paragraph(
            "\nPRESENTE ESTE TICKET AL SALIR\n" +
            "El código QR será escaneado para calcular el monto a pagar"
        )
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(15);
        document.add(instrucciones);
        
        // ===== PIE DE PÁGINA =====
        Paragraph footer = new Paragraph(
            "\nSistema de Parqueadero\n" +
            "Conserve este ticket"
        )
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);
        document.add(footer);
        
        document.close();
        return baos.toByteArray();
    }
    
    private void addTableRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setFontSize(10).setBold())
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setPaddingBottom(5);
        table.addCell(labelCell);
        
        Cell valueCell = new Cell()
                .add(new Paragraph(value).setFontSize(10))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setPaddingBottom(5);
        table.addCell(valueCell);
    }
}
