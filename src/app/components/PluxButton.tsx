import { useEffect } from "react";
import { iniciarDatos } from "../configuration/ppx.index";
const PpxButton = ({ data }) => {
  const estiloBoton = {
    display: "none",
    backgroundColor: "#FAFAFA",
    right: "80px",
    backgroundImage:
      "url(https://sandbox-paybox.pagoplux.com/img/pagar.png?v1)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    height: "96px",
    width: "215px",
    border: "none",
    cursor: "pointer",
    backgroundSize: "contain",
    outline: "0",
    boxShadow: "0px 2px 2px lightgray",
  };
  useEffect(() => {
    iniciarDatos(data);
  }, [data]);
  return (
    <>
      <div id="modalPaybox"></div>
      <button style={estiloBoton} id="pay" type="submit"></button>
    </>
  );
};
export default PpxButton;
