import React, { useState, useEffect, Fragment } from "react";
import classnames from "classnames";
import confetti from "canvas-confetti";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import "./Game.css";
import logo from "../../assets/logo.png";
import { UnclosableModal } from "../../components/UnclosableModal";

export const Game = ({ setCurrentScreen }) => {
  const [perguntasFaceis, setPerguntasFaceis] = useState(null);
  const [perguntasMedias, setPerguntasMedias] = useState(null);
  const [perguntasDificeis, setPerguntasDificeis] = useState(null);
  const [currentPergunta, setCurrentPergunta] = useState(null);
  const [currentNivel, setCurrentNivel] = useState(0);
  const [timerInicio, setTimerInicio] = useState(null);
  const [counterInicio, setCounterInicio] = useState(3);
  const [timerPergunta, setTimerPergunta] = useState(null);
  const [counterPergunta, setCounterPergunta] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [pularDisponiveis, setPularDisponiveis] = useState(3);
  const [recorde, setRecorde] = useState(0);
  const [recompensas, setRecompensas] = useState([]);
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
    fetch("/data/recompensas.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha ao buscar o arquivo de recompensas");
        }
        return response.text();
      })
      .then((text) => {
        const arrayRecompensas = JSON.parse(text);
        setRecompensas(arrayRecompensas);
      })
      .catch((error) => {
        console.error("Erro ao carregar recompensas:", error);
      });
  }, []);

  useEffect(() => {
    if (counterInicio === 0) {
      clearInterval(timerInicio);
      getPerguntaAleatoria(currentNivel);
      iniciaTimerPergunta();
    }
  }, [counterInicio]);

  useEffect(() => {
    if (counterPergunta === 0) {
      clearInterval(timerPergunta);
      setShowModal(true);
    }
  }, [counterPergunta]);

  useEffect(() => {
    const recordeSalvo = localStorage.getItem("recordeQuiz");
    if (recordeSalvo) {
      setRecorde(parseInt(recordeSalvo));
    }
  }, []);

  const passaNivel = () => {
    if (currentNivel === 14) {
      setCurrentNivel(14);
      setShowModal(true);
      setGameWon(true);
      confetti({ particleCount: 200 });
    } else {
      setCurrentNivel((prev) => prev + 1);
      getPerguntaAleatoria(currentNivel + 1);
      iniciaTimerPergunta();
    }
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
  };

  const responderPergunta = (resposta) => {
    clearInterval(timerPergunta);
    setSelectedAnswer(resposta);
    const correct = currentPergunta.resposta === resposta.toString();
    setIsAnswerCorrect(correct);
    const highlightInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 80);
    setTimeout(() => {
      clearInterval(highlightInterval);
      setBlink(false);
      if (correct) {
        passaNivel();
      } else {
        setGameOver(true);
        setShowModal(true);
      }
    }, 1500);
  };

  const pularPergunta = () => {
    if (pularDisponiveis > 0) {
      setPularDisponiveis((prev) => prev - 1);
      getPerguntaAleatoria(currentNivel);
      iniciaTimerPergunta();
    }
  };

  const finalizarJogo = () => {
    const progressoAtual = gameWon ? 100 : recompensas[currentNivel] || 0;

    if (progressoAtual > recorde) {
      localStorage.setItem("recordeQuiz", progressoAtual.toString());
      setRecorde(progressoAtual);
    }
    setCurrentScreen("home");
  };

  return (
    <section className='game background'>
      <UnclosableModal
        title={
          counterPergunta === 0
            ? "Tempo Esgotado"
            : gameOver
            ? "Resposta Incorreta"
            : gameWon
            ? "Parabéns, Você Venceu!"
            : ""
        }
        show={showModal}
        setShow={setShowModal}>
        <p>
          {counterPergunta === 0 &&
            `Infelizmente, o tempo acabou. A resposta correta era "${
              currentPergunta.alternativas[
                parseInt(currentPergunta.resposta) - 1
              ]
            }".`}
          {gameOver &&
            `Resposta incorreta. A resposta correta era "${
              currentPergunta.alternativas[
                parseInt(currentPergunta.resposta) - 1
              ]
            }".`}
          {gameWon && (
            <Fragment>
              Parabéns! Você completou o questionário da OBI com sucesso!
            </Fragment>
          )}
        </p>
        {(counterPergunta === 0 || gameOver) && (
          <p>
            Você completou{" "}
            <strong>{`${recompensas[currentNivel].toString()}%`}</strong> do
            quiz. Refaça o teste para aprimorar seu desempenho. Recomendamos que
            você estude o tópico "{currentPergunta.competencia}" para se
            preparar melhor.
          </p>
        )}

        <div className='text-center mt-5'>
          <Button className='btn btn-primary' onClick={finalizarJogo}>
            Voltar
          </Button>
        </div>
      </UnclosableModal>
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
                  <p className='text-light'>Pergunta Nº {currentNivel + 1}</p>
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
                        <div className='valor'>
                          {recompensas[currentNivel].toString() + "%"}
                        </div>
                        <p
                          className='opcao'
                          onClick={() => {
                            if (
                              window.confirm(
                                `Tem certeza de que deseja encerrar o jogo?\nVocê já completou ${recompensas[
                                  currentNivel
                                ].toString()}% do quiz.`
                              )
                            )
                              setCurrentScreen("home");
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
    </section>
  );
};
