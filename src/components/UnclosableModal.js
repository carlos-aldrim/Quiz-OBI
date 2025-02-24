import React from 'react';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';

export const UnclosableModal = (props) => {
  const { title, children, show, setShow } = props;

  return (
    <Modal show={show} onHide={() => setShow(false)} centered backdrop='static' keyboard={false}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

UnclosableModal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.array.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
};