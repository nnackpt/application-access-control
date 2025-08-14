import React from 'react';
import styled from 'styled-components';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomCheckbox = ({ checked, onChange }: CustomCheckboxProps) => {
  return (
    <StyledWrapper>
      <label className="container">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <div className="checkmark" />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Hide the default checkbox */
  .container input {
    display: none;
  }

  .container {
    display: block;
    position: relative;
    cursor: pointer;
    font-size: 18px;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Create a custom checkbox */
  .checkmark {
    position: relative;
    top: 0;
    left: 0;
    height: 1.3em;
    width: 1.3em;
    background-color: #2196f300;
    border-radius: 0.25em;
    transition: all 0.25s;
    border: 0.1em solid var(--primary-color-dark); 
  }

  /* When the checkbox is checked, add a blue background */
  .container input:checked ~ .checkmark {
    background-color: var(--primary-color);
    border-color: var(--primary-color); 
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    transform: rotate(0deg);
    border: 0.1em solid black;
    left: 0;
    top: 0;
    width: 1.05em;
    height: 1.05em;
    border-radius: 0.25em;
    transition: all 0.25s, border-width 0.1s;
    display: none; 
  }

  /* Show the checkmark when checked */
  .container input:checked ~ .checkmark:after {
    display: block; 
    left: 0.45em;
    top: 0.25em;
    width: 0.25em;
    height: 0.5em;
    border-color: #fff0 white white #fff0;
    border-width: 0 0.15em 0.15em 0;
    border-radius: 0em;
    transform: rotate(45deg);
  }
`;

export default CustomCheckbox;