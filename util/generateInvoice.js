const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generatePDF = async (data) => {
  const outputPath = path.resolve(__dirname, "../temp/invoice.pdf");

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      console.log("object");

      let yPosition = 200;

      // Page Header
      const addPageHeader = () => {
        doc.image("./images/logo.png", 40, 65, { width: 50 });
        doc.fontSize(32).text("Helton Hotel", 110, 67);
        doc.fontSize(22).text("Hotel Invoice", 110, 97);

        doc
          .fontSize(12)
          .text("123 Main Street", 400, 45, { align: "right" })
          .text("132@helton.com", 400, 60, { align: "right" })
          .text("80634565", 400, 75, { align: "right" })
          .text("heltonhotel.com", 400, 90, { align: "right" });

        yPosition = 200;
      };

      // Add Billed To Section
      const addBilledToSection = () => {
        doc
          .fontSize(12)
          .fillColor("steelblue")
          .text("Billed To:", 40, yPosition);
        doc.text("Date of Issue", 180, yPosition);
        doc.text("Due Date", 180, yPosition + 50);
        doc.text("Invoice No.", 300, yPosition);
        doc.text("Amount Due (CAD)", 430, yPosition, { align: "right" });

        // User Information
        doc
          .fontSize(12)
          .fillColor("black")
          .text(data.username, 40, yPosition + 20)
          .text(data.email, 40, yPosition + 35)
          .text("123 Main Street", 40, yPosition + 50)
          .text("16456163", 40, yPosition + 65);

        const issueDate = new Date(data.checkOutDate);
        const dueDate = new Date(issueDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        doc.text(issueDate.toDateString(), 180, yPosition + 20);
        doc.text(dueDate.toDateString(), 180, yPosition + 70);
        doc.text("000045", 300, yPosition + 20);

        yPosition = 350;
      };

      // Add Table Header
      const addTableHeader = () => {
        doc
          .moveTo(40, yPosition)
          .lineWidth(3)
          .lineTo(560, yPosition)
          .stroke("steelblue");
        yPosition += 15;

        doc
          .fontSize(12)
          .fillColor("steelblue")
          .text("Description", 40, yPosition)
          .text("Rate", 300, yPosition)
          .text("Qty", 400, yPosition)
          .text("Total", 500, yPosition, { align: "right" });

        yPosition += 25;
      };

      // Add Table Rows
      const addTableRows = () => {
        doc.fontSize(12).fillColor("black");
        data.items.forEach((item) => {
          if (yPosition >= 675) {
            doc.addPage();
            addPageHeader();
            addTableHeader();
          }

          doc
            .text(item.serviceId.name, 40, yPosition)
            .text(item.serviceId.price.toFixed(2), 300, yPosition)
            .text(item.quantity, 400, yPosition)
            .text(
              (item.serviceId.price * item.quantity).toFixed(2),
              500,
              yPosition,
              { align: "right" }
            );

          yPosition += 20;

          doc
            .moveTo(40, yPosition)
            .lineWidth(0.5)
            .lineTo(560, yPosition)
            .stroke("lightgray");
          yPosition += 15;
        });
      };

      // Add Totals Section
      const addTotals = () => {
        const subtotal = data.items.reduce(
          (sum, item) => sum + item.serviceId.price * item.quantity,
          0
        );
        const tax = subtotal * 0.13; // Assuming 13% tax
        const total = subtotal + tax;

        doc
          .fontSize(12)
          .text("Subtotal:", 380, yPosition + 20, { align: "left" })
          .text(subtotal.toFixed(2), 500, yPosition + 20, { align: "right" });

        doc
          .text("Tax (13%):", 380, yPosition + 40, { align: "left" })
          .text(tax.toFixed(2), 500, yPosition + 40, { align: "right" });

        doc
          .text("Total:", 380, yPosition + 60, { align: "left" })
          .text(total.toFixed(2), 500, yPosition + 60, { align: "right" });

        doc
          .text("Amount Paid:", 380, yPosition + 80, { align: "left" })
          .text(data.amountPaid.toFixed(2), 500, yPosition + 80, {
            align: "right",
          });

        doc
          .text("Amount Due (CAD):", 380, yPosition + 100, { align: "left" })
          .text((total - data.amountPaid).toFixed(2), 500, yPosition + 100, {
            align: "right",
          });

          doc.text((total - data.amountPaid).toFixed(2), 430, 220, {
            align: "right",
          });
      };

      const addFooter = () => {
      if (yPosition > 750) {
          doc.addPage();
          addPageHeader();
      }
      doc.fontSize(14).text("Thank you for your business!", 40, yPosition+120); 
      doc.fontSize(12).text("Payment is due within 30 days", 40, yPosition+140);
      doc.fontSize(14).text("Guest Sign", 400, yPosition+120); 
      doc.fontSize(12).text("_____________", 400, yPosition+140);
      }
    


      // Generate PDF Content
      addPageHeader();
      addBilledToSection();
      addTableHeader();
      addTableRows();
      addTotals();
      addFooter();
      
      // Finalize the PDF
      doc.end();

      writeStream.on("finish", () => resolve(outputPath));
      writeStream.on("error", (err) => {
        console.error("Write stream error:", err);
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generatePDF;
