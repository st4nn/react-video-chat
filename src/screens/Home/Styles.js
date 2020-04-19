import styled from "styled-components";

export const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    height: 100vh;
    width: 100vw;
    
    & > *{
        max-width: 360px;
    }

    & > form .form-control{
        margin: 2rem 0;
    }
`;