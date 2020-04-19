import styled from "styled-components";

export const Container = styled.div`
    height: 100vh;
    position: relative;
    width: 100vw;
`;

export const ButtonsContainer = styled.div`
    bottom: 1rem;
    left: 1rem;
    position: fixed;
    width: 2rem;
    z-index: 2;

    & button{
        background-color: rgba(0, 0, 0, 0.24);
        border: none;
        border-radius: 50%;
        box-shadow: 2px 2px 24px #444;
        color: white;
        cursor: pointer;
        font-size: 2rem;
        margin-bottom: 12px;
        padding: 12px 16px;
        transition: 120ms;
    }

    & button:hover{
        background-color: var(--primary);
        box-shadow: 4px 4px 48px #666;
    }

    & button:focus{
        outline: none;
    }

    & button.selected{
        background-color: var(--primary);
    }
`;

export const LoadingContainer = styled.div`
    align-items: center;
    background: rgba(0, 0, 0, 0.64);
    display: flex;
    font-size: 4rem;
    justify-content: center;
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 3;
`;