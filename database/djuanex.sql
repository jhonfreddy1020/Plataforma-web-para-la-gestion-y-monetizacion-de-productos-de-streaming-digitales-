DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

/*
 SISTEMA WEB DE VENTA DE PRODUCTOS STREAMING
 PostgreSQL - Version Final Profesional
 Incluye:
 *Tablas normalizadas
 *Relaciones PK/FK
 *Triggers automáticos
 *Flujo carrito -> pedido -> pago
*/


/*
1 TABLA USUARIO
0 = Admin
1 = Cliente
*/
CREATE TABLE Usuario (
    idUsuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    claveHash VARCHAR(255) NOT NULL,
    rol INT NOT NULL CHECK (rol IN (0,1)),
    estado BOOLEAN DEFAULT TRUE
);

/*
TABLA PRODUCTO
precioCompra = costo al proveedor
precioVenta  = precio al cliente final

0 = Streaming
1 = Música
2 = Gaming
3 = Deportes
4 = IA
5 = Oficina
6 = Otro
*/
CREATE TABLE Producto (
    idProducto INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precioCompra INT NOT NULL CHECK (precioCompra >= 0),
    precioVenta INT NOT NULL CHECK (precioVenta >= 0),
    disponible BOOLEAN DEFAULT TRUE,
    tipo INT DEFAULT 0 CHECK (tipo IN (0,1,2,3,4,5,6))
);

/*
TABLA CARRITO
0 = Activo (carrito actual del cliente)
1 = Convertido (ya genero pedido)
*/
CREATE TABLE Carrito (
    idCarrito INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idUsuario INT NOT NULL,
    estado INT DEFAULT 0 CHECK (estado IN (0,1)),
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (idUsuario)
    REFERENCES Usuario(idUsuario)
);

/*
TABLA ITEMCARRITO
Guarda productos dentro del carrito

precioUnitario:
Se guarda historico del precio al momento de compra.
Si mañana cambia el precio del producto,
este registro conserva el valor original.
*/
CREATE TABLE ItemCarrito (
    idItem INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idCarrito INT NOT NULL,
    idProducto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioUnitario INT,

    FOREIGN KEY (idCarrito)
    REFERENCES Carrito(idCarrito),

    FOREIGN KEY (idProducto)
    REFERENCES Producto(idProducto)
);

/*
TABLA PEDIDO
0 = Pendiente
1 = Pagado
2 = Eliminado
*/
CREATE TABLE Pedido (
    idPedido INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idUsuario INT NOT NULL,
    idCarrito INT NOT NULL,
    estado INT DEFAULT 0 CHECK (estado IN (0,1,2)),
    total INT,

    FOREIGN KEY (idUsuario)
    REFERENCES Usuario(idUsuario),

    FOREIGN KEY (idCarrito)
    REFERENCES Carrito(idCarrito)
);

/*
TABLA PAGO
0 = No validado
1 = Validado
*/
CREATE TABLE Pago (
    idPago INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idPedido INT UNIQUE NOT NULL,

    /*0-Efectivo, 1-Transferencia, 2-Otro*/
    metodoPago INT DEFAULT 0 CHECK (metodoPago IN (0,1,2)),
    estadoValidacion INT DEFAULT 0 CHECK (estadoValidacion IN (0,1)),
    comprobante VARCHAR(255);
    fechaPago TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    /*0 = Nequi, 1 = Bre-B, 2= Otro*/
    cuentaDestino INT DEFAULT 0 CHECK (cuentaDestino IN (0,1,2));

    FOREIGN KEY (idPedido)
    REFERENCES Pedido(idPedido)
);

/*
RESTRICCIÓN IMPORTANTE
Solo 1 carrito activo por usuario
*/
CREATE UNIQUE INDEX idx_unico_carrito_activo
ON Carrito(idUsuario)
WHERE estado = 0;

/*
TRIGGER 1
AUTOLLENAR PRECIO UNITARIO
*/
CREATE OR REPLACE FUNCTION fn_precio_itemcarrito()
RETURNS TRIGGER AS
$$
BEGIN

    SELECT precioVenta
    INTO NEW.precioUnitario
    FROM Producto
    WHERE idProducto = NEW.idProducto;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_precio_itemcarrito
BEFORE INSERT
ON ItemCarrito
FOR EACH ROW
EXECUTE FUNCTION fn_precio_itemcarrito();

/*
TRIGGER 2
PROCESAR COMPRA AUTOMATICA
*/
CREATE OR REPLACE FUNCTION fn_procesar_compra()
RETURNS TRIGGER AS
$$
DECLARE
    v_total INT;
BEGIN

    IF OLD.estado = 0 AND NEW.estado = 1 THEN

        SELECT COALESCE(SUM(cantidad * precioUnitario),0)
        INTO v_total
        FROM ItemCarrito
        WHERE idCarrito = NEW.idCarrito;

        INSERT INTO Pedido(
            idUsuario,
            idCarrito,
            estado,
            total
        )
        VALUES(
            NEW.idUsuario,
            NEW.idCarrito,
            0,
            v_total
        );

        INSERT INTO Carrito(
            idUsuario,
            estado
        )
        VALUES(
            NEW.idUsuario,
            0
        );

    END IF;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_procesar_compra
AFTER UPDATE OF estado
ON Carrito
FOR EACH ROW
EXECUTE FUNCTION fn_procesar_compra();

/*
TRIGGER 3
VALIDACIÓN DE PAGO AUTOMÁTICA
*/
CREATE OR REPLACE FUNCTION fn_validar_pago_actualizar_pedido()
RETURNS TRIGGER AS
$$
BEGIN

    IF OLD.estadoValidacion = 0
       AND NEW.estadoValidacion = 1 THEN

        UPDATE Pedido
        SET estado = 1
        WHERE idPedido = NEW.idPedido;

    END IF;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_validacion_pago
AFTER UPDATE OF estadoValidacion
ON Pago
FOR EACH ROW
EXECUTE FUNCTION fn_validar_pago_actualizar_pedido();

/*
DATOS DE PRUEBA
*/

/* Insertar Usuarios */
INSERT INTO Usuario(nombre,email,claveHash,rol)
VALUES
('Juan','juan@gmail.com','hash',1),
('Felipe','felipe@gmail.com','hash',0);

/* Insertar Productos */
INSERT INTO Producto(nombre,precioCompra,precioVenta,tipo)
VALUES
('Netflix Premium',9000,15000,0),
('Spotify Familiar',6000,10000,1),
('Disney Plus',6000,12000,3),
('Xbox Game Pass',22000,35000,2),
('Office 365',10000,35000,5),
('ChatGPT Plus',10000,18000,4),
('IPTV',2500,7000,6);

/*
CONSULTAS DE EJEMPLO
*/

/*
SELECT * FROM Producto;

SELECT nombre, precioVenta
FROM Producto
WHERE nombre ILIKE '%net%'
AND precioVenta BETWEEN 10000 AND 20000
AND disponible = TRUE;

SELECT nombre, precioVenta, disponible
FROM Producto
WHERE nombre ILIKE '%c%'
AND precioVenta BETWEEN 10000 AND 20000
AND disponible = TRUE;
*/

/* Crear carrito inicial del usuario */
INSERT INTO Carrito(idUsuario)
VALUES (1);

/*
1. Agregar productos al carrito
*/
INSERT INTO ItemCarrito(idCarrito,idProducto,cantidad)
VALUES
(1,1,1),
(1,2,2);

/*
2. Ver carrito actual
*/
SELECT
    p.nombre,
    ic.cantidad,
    ic.precioUnitario,
    ic.cantidad * ic.precioUnitario AS subtotal,
    SUM(ic.cantidad * ic.precioUnitario) OVER () AS total
FROM ItemCarrito ic
JOIN Producto p
ON p.idProducto = ic.idProducto
WHERE ic.idCarrito = 1;

/*
3. Usuario da clic en PAGAR
*/
UPDATE Carrito
SET estado = 1
WHERE idCarrito = 1;

/*
4. Ver pedidos generados
*/
SELECT * FROM Pedido;

/*
5. Registrar pago del pedido
*/
INSERT INTO Pago(idPedido)
VALUES (1);

/*
6. Validar pago
*/
UPDATE Pago
SET estadoValidacion = 1
WHERE idPedido = 1;

/*
CONSULTAS CLIENTE
*/

/* Pedidos pendientes */
SELECT * FROM Pedido
WHERE idUsuario = 1
AND estado = 0;

/* Pedidos pagados */
SELECT * FROM Pedido
WHERE idUsuario = 1
AND estado = 1;

/* Pedidos eliminados */
SELECT * FROM Pedido
WHERE idUsuario = 1
AND estado = 2;

/*
VER PRODUCTOS DE UN PEDIDO
*/
SELECT
    ic.idItem,
    p.nombre,
    ic.cantidad,
    ic.precioUnitario,
    ic.cantidad * ic.precioUnitario AS subtotal,
    SUM(ic.cantidad * ic.precioUnitario) OVER () AS total
FROM Pedido pe
JOIN ItemCarrito ic
ON pe.idCarrito = ic.idCarrito
JOIN Producto p
ON p.idProducto = ic.idProducto
WHERE pe.idPedido = 1;

/*
RESUMEN AUTOMATIZACIÓN

Agregar producto:
INSERT ItemCarrito

Comprar:
UPDATE Carrito estado=1

Validar pago:
UPDATE Pago estadoValidacion=1
*/