import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./Home.css";
import logo from "../../assets/logo.png";

export const Home = ({ setGameStarted }) => {
  const [recorde, setRecorde] = useState(0);

  useEffect(() => {
    const recordeSalvo = localStorage.getItem("recordeQuiz");
    if (recordeSalvo) {
      setRecorde(parseInt(recordeSalvo));
    }
  }, []);

  return (
    <section className='home background'>
      <Container>
        <Row
          className='justify-content-center align-items-center'
          style={{ minHeight: "100vh" }}>
          <Col xs={12} md={8} lg={6}>
            <div className='record'>
              {recorde}%
              <span className='record-label'>Recorde</span>{" "}
            </div>
            <div className='home-box text-center'>
              <img
                src={logo}
                alt='Logo da OBI'
                className='img-fluid mx-auto'
                style={{ maxWidth: "120px" }}
              />
              <h1 className='welcome-title mt-3'>
                Bem-vindo ao Questionário de Preparação para a OBI!
              </h1>
              <p className='description'>
                Este projeto foi desenvolvido para ajudá-lo a testar seus
                conhecimentos e aprimorar suas habilidades em lógica de
                programação. A Olimpíada Brasileira de Informática é uma
                excelente oportunidade para aprender e se destacar no mundo da
                computação!
              </p>
              <p className='instructions'>
                Ao iniciar, você responderá perguntas de diferentes níveis de
                dificuldade, podendo avaliar seu desempenho e identificar áreas
                para aprimoramento. Prepare-se e aproveite essa experiência!
              </p>
              <button
                onClick={() => setGameStarted(true)}
                className='btn btn-start mt-3'>
                Começar
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
