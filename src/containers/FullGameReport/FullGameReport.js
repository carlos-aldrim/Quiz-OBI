import React, { useState, useEffect, Fragment } from "react";
import classnames from "classnames";
import confetti from "canvas-confetti";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import "./FullGameReport.css";
import logo from "../../assets/logo.png";
import { UnclosableModal } from "../../components/UnclosableModal";

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
  const [respostaCerta, setRespostaCerta] = useState(false);
  const [pularDisponiveis, setPularDisponiveis] = useState(3);
  const [results, setResults] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [blink, setBlink] = useState(false);

  const dividePerguntas = (bancoPerguntas) => {
    const perguntas = [...bancoPerguntas];
    setPerguntasFaceis(perguntas.splice(0, 60));
    setPerguntasMedias(perguntas.splice(0, 40));
    setPerguntasDificeis(perguntas.splice(0, 20));
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
            <Button className='btn btn-primary' onClick={finalizarJogo}>
              Voltar
            </Button>
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
