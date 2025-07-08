import { handleAuthorization } from './ppx.data.js';

const iniciarDatos = (dataPago) => {
  if (window.Data) {
    // Agregar la función onAuthorize después de la inicialización
    // const dataWithCallback = {
    //   ...dataPago,
    //   onAuthorize: handleAuthorization
    // };
    window.Data.init(dataPago);
  }
};

const reload = (data) => {
  if (window.Data) {
    // const dataWithCallback = {
    //   ...data,
    //   onAuthorize: handleAuthorization
    // };
    window.Data.reload(data);
  }
};

export { iniciarDatos, reload };