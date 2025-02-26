import React, { useState, useEffect, Fragment } from "react";
import classnames from "classnames";
import confetti from "canvas-confetti";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { jsPDF } from "jspdf";
import "./FullGameReport.css";
import logo from "../../assets/logo.png";
import { UnclosableModal } from "../../components/UnclosableModal";
import { GeneratePDFReport } from "../../components/GeneratePDFReport";

export const FullGameReport = ({ setCurrentScreen }) => {
  const totalQuestions = 15;
  const [perguntasFaceis, setPerguntasFaceis] = useState([]);
  const [perguntasMedias, setPerguntasMedias] = useState([]);
  const [perguntasDificeis, setPerguntasDificeis] = useState([]);
  const [currentPergunta, setCurrentPergunta] = useState(null);
  const [currentNivel, setCurrentNivel] = useState(0);
  const [timerInicio, setTimerInicio] = useState(null);
  const [counterInicio, setCounterInicio] = useState(3);
  const [timerPergunta, setTimerPergunta] = useState(null);
  const [counterPergunta, setCounterPergunta] = useState(30);
  const [pularDisponiveis, setPularDisponiveis] = useState(3);
  const [results, setResults] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [blink, setBlink] = useState(false);

  const dividePerguntas = (bancoPerguntas) => {
    setPerguntasFaceis(
      bancoPerguntas.filter((pergunta) => pergunta.dificuldade === "Fácil")
    );
    setPerguntasMedias(
      bancoPerguntas.filter((pergunta) => pergunta.dificuldade === "Média")
    );
    setPerguntasDificeis(
      bancoPerguntas.filter((pergunta) => pergunta.dificuldade === "Difícil")
    );
  };

  const getPerguntaAleatoria = (nivelAtual) => {
    let perguntasArr, pergunta, randomIndex;
    if (nivelAtual < 6) {
      perguntasArr = [...perguntasFaceis];
      randomIndex = Math.floor(Math.random() * perguntasArr.length);
      pergunta = perguntasArr.splice(randomIndex, 1)[0];
      setPerguntasFaceis(perguntasArr);
    } else if (nivelAtual < 11) {
      perguntasArr = [...perguntasMedias];
      randomIndex = Math.floor(Math.random() * perguntasArr.length);
      pergunta = perguntasArr.splice(randomIndex, 1)[0];
      setPerguntasMedias(perguntasArr);
    } else if (nivelAtual < 16) {
      perguntasArr = [...perguntasDificeis];
      randomIndex = Math.floor(Math.random() * perguntasArr.length);
      pergunta = perguntasArr.splice(randomIndex, 1)[0];
      setPerguntasDificeis(perguntasArr);
    }
    setCurrentPergunta(pergunta);
  };

  const iniciaTimerPergunta = () => {
    clearInterval(timerPergunta);
    setCounterPergunta(30);
    setTimerPergunta(
      setInterval(() => {
        setCounterPergunta((c) => c - 1);
      }, 1000)
    );
  };

  useEffect(() => {
    fetch("/data/perguntas.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha ao buscar o arquivo de perguntas");
        }
        return response.text();
      })
      .then((text) => {
        const bancoPerguntas = JSON.parse(text);
        dividePerguntas(bancoPerguntas);
        setCurrentNivel(0);
        setTimerInicio(
          setInterval(() => {
            setCounterInicio((c) => c - 1);
          }, 1000)
        );
      })
      .catch((error) =>
        console.error("Erro ao carregar as perguntas do arquivo:", error)
      );
  }, []);

  useEffect(() => {
    if (counterInicio === 0) {
      clearInterval(timerInicio);
      getPerguntaAleatoria(0);
      iniciaTimerPergunta();
    }
  }, [counterInicio]);

  useEffect(() => {
    if (counterPergunta === 0) {
      clearInterval(timerPergunta);
      setResults((prev) => [
        ...prev,
        {
          pergunta: currentPergunta,
          isCorrect: false,
          reason: "Tempo Esgotado",
        },
      ]);
      setTimeout(() => {
        nextPergunta();
      }, 1500);
    }
  }, [counterPergunta]);

  const nextPergunta = () => {
    if (currentNivel === totalQuestions - 1) {
      setQuizFinished(true);
      clearInterval(timerPergunta);
    } else {
      setCurrentNivel((prev) => prev + 1);
      getPerguntaAleatoria(currentNivel + 1);
      iniciaTimerPergunta();
    }
  };

  const responderPergunta = (resposta) => {
    clearInterval(timerPergunta);
    setSelectedAnswer(resposta);
    const isCorrect = currentPergunta.resposta === resposta.toString();
    setIsAnswerCorrect(isCorrect);
    setResults((prev) => [
      ...prev,
      { pergunta: currentPergunta, isCorrect, selected: resposta },
    ]);
    if (isCorrect && currentNivel === totalQuestions - 1) {
      confetti({ particleCount: 200 });
    }
    const highlightInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 80);
    setTimeout(() => {
      clearInterval(highlightInterval);
      setBlink(false);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      nextPergunta();
    }, 1500);
  };

  const pularPergunta = () => {
    if (pularDisponiveis > 0) {
      setPularDisponiveis((prev) => prev - 1);
      setResults((prev) => [
        ...prev,
        { pergunta: currentPergunta, isCorrect: false, skipped: true },
      ]);
      nextPergunta();
    }
  };

  const finalizarJogo = () => {
    setCurrentScreen("home");
  };

  const correctCount = results.filter((r) => r.isCorrect).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const topicsToStudy = [
    ...new Set(
      results.filter((r) => !r.isCorrect).map((r) => r.pergunta.competencia)
    ),
  ];

  const generatePDFReport = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    // Fundo geral do PDF (um tom de cinza claro, por exemplo)
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  
    // Cabeçalho com cor de fundo personalizada
    doc.setFillColor(60, 141, 188); // Tom de azul
    doc.rect(0, 0, pageWidth, 60, "F");
  
    // Adiciona a logo no canto superior esquerdo (ajuste x, y, width e height conforme necessário)
    // Se a imagem não estiver em base64, pode ser necessário convertê-la previamente.
    doc.addImage(logo, "PNG", 20, 10, 40, 40);
  
    // Título centralizado no cabeçalho
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Relatório Final de Estudo", pageWidth / 2, 35, { align: "center" });
  
    // Corpo do relatório
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    let yPosition = 90; // Ponto de partida abaixo do cabeçalho
  
    // Exibe as informações do quiz
    doc.text(`Você concluiu o quiz.`, 40, yPosition);
    yPosition += 25;
    doc.text(
      `Acertos: ${correctCount} de ${totalQuestions} (${percentage}%)`,
      40,
      yPosition
    );
    yPosition += 35;
  
    if (topicsToStudy.length > 0) {
      doc.text("Recomendamos revisar os seguintes tópicos:", 40, yPosition);
      yPosition += 25;
      topicsToStudy.forEach((topic, index) => {
        doc.text(`${index + 1}. ${topic}`, 60, yPosition);
        yPosition += 20;
      });
    } else {
      doc.text("Parabéns! Você acertou todas as questões!", 40, yPosition);
    }
  
    // Elementos gráficos adicionais, como linhas ou retângulos, podem ser adicionados:
    doc.setDrawColor(60, 141, 188);
    doc.setLineWidth(2);
    doc.line(40, yPosition + 10, pageWidth - 40, yPosition + 10);
  
    doc.save("relatorio_estudo.pdf");
  };

  return (
    <section className='game background'>
      {quizFinished && (
        <UnclosableModal title='Relatório Final' show={true} setShow={() => {}}>
          <p>Você concluiu o quiz.</p>
          <p>
            Acertos: {correctCount} de {totalQuestions} ({percentage}%)
          </p>
          {topicsToStudy.length > 0 ? (
            <div>
              <p>Recomendamos revisar os seguintes tópicos:</p>
              <ul>
                {topicsToStudy.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Parabéns! Você acertou todas as questões!</p>
          )}
          <div className='text-center mt-5'>
            <Button className='btn btn-primary mr-2' onClick={finalizarJogo}>
              Voltar
            </Button>
            {topicsToStudy.length > 0 && (
              <Button
              className='btn btn-secondary mt-2'
              onClick={() => GeneratePDFReport(correctCount, totalQuestions, percentage, topicsToStudy)}
            >
              Gerar PDF
            </Button>
            )}
          </div>
        </UnclosableModal>
      )}

      {!quizFinished && (
        <>
          <div className='timer-pergunta'>{counterPergunta}</div>
          <Container className='py-4'>
            <Row>
              <Col>
                <div className='game-control text-center'>
                  <img
                    src={logo}
                    alt='Logo da OBI'
                    className='img-fluid d-block mx-auto'
                    style={{ maxWidth: "240px" }}
                  />
                  {counterInicio === 0 && (
                    <div className='contador-perguntas'>
                      <p className='text-light'>
                        Pergunta Nº {currentNivel + 1}
                      </p>
                    </div>
                  )}
                  <div className='pergunta'>
                    <p className='m-0'>
                      {counterInicio !== 0
                        ? counterInicio
                        : currentPergunta && currentPergunta.pergunta}
                    </p>
                  </div>

                  {counterInicio === 0 && currentPergunta && (
                    <Fragment>
                      <div className='alternativas text-center'>
                        {currentPergunta.alternativas.map((alternativa, i) => (
                          <div
                            onClick={() => responderPergunta(i + 1)}
                            className={classnames("alternativa", {
                              highlight: blink && selectedAnswer === i + 1,
                              certa:
                                blink &&
                                selectedAnswer === i + 1 &&
                                isAnswerCorrect,
                              errada:
                                blink &&
                                selectedAnswer === i + 1 &&
                                !isAnswerCorrect,
                            })}
                            key={i}>
                            <span className='numero-alternativa'>{i + 1}</span>
                            {alternativa}
                          </div>
                        ))}
                      </div>

                      <Row className='mt-4'>
                        <Col xs='auto' className='mx-auto'>
                          <div className='text-center opcoes'>
                            {pularDisponiveis > 0 && (
                              <div className='opcao' onClick={pularPergunta}>
                                Pular Pergunta ({pularDisponiveis})
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <Row className='mt-5'>
                        <Col xs='auto' className='mx-auto'>
                          <div className='text-center projecoes'>
                            <p
                              className='opcao'
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Tem certeza de que deseja encerrar o jogo?`
                                  )
                                ) {
                                  setQuizFinished(true);
                                  clearInterval(timerPergunta);
                                  setCurrentScreen("home");
                                }
                              }}>
                              Encerrar Jogo
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </Fragment>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </>
      )}
    </section>
  );
};