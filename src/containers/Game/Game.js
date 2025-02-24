import React, { useState, useEffect, Fragment } from "react";
import classnames from "classnames";
import confetti from "canvas-confetti";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import { bancoPerguntas } from "../../data/perguntas";
import { recompensaPorNivel } from "../../data/recompensas";
import "./Game.css";
import logo from "../../assets/logo.png";
import { UnclosableModal } from "../../components/UnclosableModal";

export const Game = ({ setGameStarted }) => {
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

  const [respostaCerta, setRespostaCerta] = useState(false);

  const [pularDisponiveis, setPularDisponiveis] = useState(3);

  const [recorde, setRecorde] = useState(0);

  const dividePerguntas = () => {
    const perguntas = [...bancoPerguntas];
    setPerguntasFaceis(perguntas.splice(0, 100));
    setPerguntasMedias(perguntas.splice(0, 100));
    setPerguntasDificeis(perguntas.splice(0, 100));
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
    dividePerguntas();
    setCurrentNivel(1);
    setTimerInicio(
      setInterval(() => {
        setCounterInicio((c) => c - 1);
      }, 1000)
    );
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
    if (currentNivel === 15) {
      setShowModal(true);
      setGameWon(true);
      confetti({ particleCount: 200 });
    } else {
      setCurrentNivel((prev) => prev + 1);
      getPerguntaAleatoria(currentNivel + 1);
      iniciaTimerPergunta();
    }
  };

  const responderPergunta = (resposta) => {
    clearInterval(timerPergunta);
    if (currentPergunta.resposta === resposta.toString()) {
      const highlightInterval = setInterval(() => {
        setRespostaCerta((prev) => !prev);
      }, 80);
      setTimeout(() => {
        clearInterval(highlightInterval);
        setRespostaCerta(false);
        passaNivel();
      }, 1500);
    } else {
      setGameOver(true);
      setShowModal(true);
    }
  };

  const pularPergunta = () => {
    if (pularDisponiveis > 0) {
      setPularDisponiveis((prev) => prev - 1);
      getPerguntaAleatoria(currentNivel);
      iniciaTimerPergunta();
    }
  };

  const finalizarJogo = () => {
    const progressoAtual = recompensaPorNivel[currentNivel] || 0;

    if (progressoAtual > recorde) {
      localStorage.setItem("recordeQuiz", progressoAtual.toString());
      setRecorde(progressoAtual);
    }

    setGameStarted(false);
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
            <strong>
              {currentNivel === 1
                ? "0%"
                : `${recompensaPorNivel[currentNivel].toString()}%`}
            </strong>{" "}
            do quiz. Refaça o teste para aprimorar seu desempenho. Recomendamos
            que você estude o tópico "{currentPergunta.competencia}" para se
            preparar melhor.
          </p>
        )}

        <div className='text-center mt-5'>
          <Button className='btn btn-primary' onClick={finalizarJogo}>
            Reiniciar Jogo
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
                  <p className='text-light'>Pergunta Nº {currentNivel}</p>
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
                        onClick={() => {
                          responderPergunta(i + 1);
                        }}
                        className={classnames("alternativa", {
                          certa: i + 1 === parseInt(currentPergunta.resposta),
                          highlight: respostaCerta,
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
                          {recompensaPorNivel[currentNivel].toString() + "%"}
                        </div>
                        <p
                          className='opcao'
                          onClick={() => {
                            if (
                              window.confirm(
                                `Tem certeza de que deseja encerrar o jogo?\nVocê já completou ${recompensaPorNivel[
                                  currentNivel
                                ].toString()}% do quiz.`
                              )
                            )
                              setGameStarted(false);
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
