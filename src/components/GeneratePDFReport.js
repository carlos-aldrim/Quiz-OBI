import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Chart } from "chart.js/auto";
import logo from "../assets/logo.png";

export const GeneratePDFReport = async (
  correctCount,
  totalQuestions,
  percentage,
  topicsToStudy
) => {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(60, 141, 188);
  doc.rect(0, 0, pageWidth, 80, "F");
  doc.addImage(logo, "PNG", 20, 20, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Relatório Final de Estudo", pageWidth / 2, 50, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);

  let yPos = 120;
  doc.setFont("helvetica", "bold");
  doc.text("Resumo do Desempenho", 40, yPos);
  yPos += 20;
  doc.setFont("helvetica", "normal");
  doc.text(`Você concluiu o quiz.`, 40, yPos);
  yPos += 25;
  doc.setFont("helvetica", "bold");
  doc.text(
    `Acertos: ${correctCount} de ${totalQuestions} (${percentage}%)`,
    40,
    yPos
  );
  yPos += 40;

  const chartImage = await generateChart(correctCount, totalQuestions);
  doc.addImage(chartImage, "PNG", 40, yPos, 200, 200);

  yPos += 240;

  doc.setFont("helvetica", "bold");
  doc.text("Tópicos para Revisar", 40, yPos);
  yPos += 20;
  doc.setFont("helvetica", "normal");

  if (topicsToStudy.length > 0) {
    topicsToStudy.forEach((topic, index) => {
      doc.text(`${index + 1}. ${topic}`, 60, yPos);
      yPos += 20;
    });
  } else {
    doc.text("Parabéns! Você acertou todas as questões!", 40, yPos);
  }

  doc.setDrawColor(60, 141, 188);
  doc.setLineWidth(2);
  doc.line(30, pageHeight - 50, pageWidth - 30, pageHeight - 50);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    "Gerado automaticamente em " + new Date().toLocaleDateString(),
    40,
    pageHeight - 30
  );

  doc.save("relatorio_estudo.pdf");
};

const generateChart = async (correctCount, totalQuestions) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Acertos", "Erros"],
        datasets: [
          {
            data: [correctCount, totalQuestions - correctCount],
            backgroundColor: ["#4CAF50", "#F44336"],
            borderColor: ["#388E3C", "#D32F2F"],
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: {
                size: 14,
              },
              color: "#333",
            },
          },
          tooltip: {
            enabled: true,
          },
        },
        animation: {
          onComplete: () => {
            setTimeout(() => {
              resolve(canvas.toDataURL("image/png"));
            }, 500);
          },
        },
      },
    });
  });
};
