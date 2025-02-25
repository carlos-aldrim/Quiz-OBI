import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./Home.css";
import logo from "../../assets/logo.png";

export const Home = ({ setCurrentScreen }) => {
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
              {recorde}%<span className='record-label'>Recorde</span>
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
                programação.
              </p>
              <p className='instructions'>
                Escolha entre iniciar o questionário ou visualizar o relatório
                completo dos jogos anteriores.
              </p>

              <button
                onClick={() => setCurrentScreen("game")}
                className='btn btn-start mt-3'>
                Iniciar Questionário
              </button>

              <button
                onClick={() => setCurrentScreen("fullReport")}
                className='btn btn-report mt-3'>
                Ver Relatório Completo
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
