package com.parqueadero.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.parqueadero.model.Ticket;
import com.parqueadero.repository.TicketRepository;
import com.parqueadero.util.MonedaUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    @Autowired
    private TicketRepository ticketRepository;

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public byte[] generarFacturaTicket(String codigoTicket) throws Exception {
        Ticket ticket = ticketRepository.findByCodigo(codigoTicket)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Color corporativo
        DeviceRgb colorPrincipal = new DeviceRgb(44, 62, 80); // #2C3E50

        // Encabezado
        Paragraph titulo = new Paragraph("FACTURA DE PARQUEADERO")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(colorPrincipal);
        document.add(titulo);

        Paragraph subtitulo = new Paragraph("Sistema de Gestión de Estacionamiento")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY);
        document.add(subtitulo);

        document.add(new Paragraph("\n"));

        // Información del parqueadero
        Table infoParqueadero = new Table(1);
        infoParqueadero.setWidth(UnitValue.createPercentValue(100));
        infoParqueadero.addCell(createCell("Parqueadero Central", true, TextAlignment.CENTER));
        infoParqueadero.addCell(createCell("Dirección: Calle Principal #123", false, TextAlignment.CENTER));
        infoParqueadero.addCell(createCell("Teléfono: (1) 234-5678 | Email: info@parqueadero.com", false, TextAlignment.CENTER));
        document.add(infoParqueadero);

        document.add(new Paragraph("\n"));

        // Código QR del ticket
        byte[] qrCode = generarCodigoQR(ticket.getCodigo());
        Image qrImage = new Image(ImageDataFactory.create(qrCode));
        qrImage.setWidth(100);
        qrImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
        document.add(qrImage);

        document.add(new Paragraph("\n"));

        // Información del ticket
        Table infoTicket = new Table(2);
        infoTicket.setWidth(UnitValue.createPercentValue(100));
        
        infoTicket.addCell(createInfoCell("Código:", true));
        infoTicket.addCell(createInfoCell(ticket.getCodigo(), false));
        
        infoTicket.addCell(createInfoCell("Placa del Vehículo:", true));
        infoTicket.addCell(createInfoCell(ticket.getVehiculo().getPlaca(), false));
        
        infoTicket.addCell(createInfoCell("Tipo de Vehículo:", true));
        infoTicket.addCell(createInfoCell(ticket.getVehiculo().getTipo().toString(), false));
        
        if (ticket.getVehiculo().getMarca() != null) {
            infoTicket.addCell(createInfoCell("Marca/Modelo:", true));
            infoTicket.addCell(createInfoCell(
                ticket.getVehiculo().getMarca() + " " + 
                (ticket.getVehiculo().getModelo() != null ? ticket.getVehiculo().getModelo() : ""), 
                false
            ));
        }
        
        infoTicket.addCell(createInfoCell("Fecha/Hora Entrada:", true));
        infoTicket.addCell(createInfoCell(ticket.getFechaHoraEntrada().format(FORMATO_FECHA), false));
        
        if (ticket.getFechaHoraSalida() != null) {
            infoTicket.addCell(createInfoCell("Fecha/Hora Salida:", true));
            infoTicket.addCell(createInfoCell(ticket.getFechaHoraSalida().format(FORMATO_FECHA), false));
        }
        
        infoTicket.addCell(createInfoCell("Operador Entrada:", true));
        infoTicket.addCell(createInfoCell(ticket.getUsuarioEntrada().getUsername(), false));
        
        if (ticket.getUsuarioSalida() != null) {
            infoTicket.addCell(createInfoCell("Operador Salida:", true));
            infoTicket.addCell(createInfoCell(ticket.getUsuarioSalida().getUsername(), false));
        }
        
        infoTicket.addCell(createInfoCell("Estado:", true));
        infoTicket.addCell(createInfoCell(ticket.getEstado().toString(), false));
        
        document.add(infoTicket);

        document.add(new Paragraph("\n"));

        // Total a pagar
        if (ticket.getMontoTotal() != null) {
            Table totalTable = new Table(2);
            totalTable.setWidth(UnitValue.createPercentValue(100));
            totalTable.addCell(createTotalCell("TOTAL A PAGAR:", true));
            totalTable.addCell(createTotalCell(MonedaUtil.formatearCOP(ticket.getMontoTotal()), false));
            document.add(totalTable);
        }

        document.add(new Paragraph("\n"));

        // Pie de página
        Paragraph piePagina = new Paragraph("Gracias por utilizar nuestros servicios")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY);
        document.add(piePagina);

        Paragraph info = new Paragraph("Conserve este documento como comprobante de pago")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.LIGHT_GRAY);
        document.add(info);

        document.close();
        return baos.toByteArray();
    }

    private Cell createCell(String content, boolean bold, TextAlignment alignment) {
        Paragraph p = new Paragraph(content).setFontSize(10);
        if (bold) p.setBold();
        Cell cell = new Cell().add(p);
        cell.setTextAlignment(alignment);
        cell.setBorder(Border.NO_BORDER);
        return cell;
    }

    private Cell createInfoCell(String content, boolean bold) {
        Paragraph p = new Paragraph(content).setFontSize(10);
        if (bold) p.setBold();
        return new Cell().add(p).setPadding(5);
    }

    private Cell createTotalCell(String content, boolean bold) {
        Paragraph p = new Paragraph(content).setFontSize(14);
        if (bold) {
            p.setBold();
        } else {
            p.setBold().setFontColor(new DeviceRgb(22, 163, 74)); // Verde
        }
        Cell cell = new Cell().add(p);
        cell.setPadding(10);
        cell.setTextAlignment(bold ? TextAlignment.RIGHT : TextAlignment.LEFT);
        return cell;
    }

    private byte[] generarCodigoQR(String texto) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(texto, BarcodeFormat.QR_CODE, 200, 200);
        
        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", baos);
        
        return baos.toByteArray();
    }
}
