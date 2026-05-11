DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

/*==============================================================
 SISTEMA WEB DE VENTA DE PRODUCTOS STREAMING
 PostgreSQL - Versión Final Profesional
 Incluye:
 ✔ Tablas normalizadas
 ✔ Relaciones PK/FK
 ✔ Triggers automáticos
 ✔ Flujo carrito -> pedido -> pago
==============================================================*/


/*==============================================================
1️⃣ TABLA USUARIO
0 = Admin
1 = Cliente
==============================================================*/
CREATE TABLE Usuario (
    idUsuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    claveHash VARCHAR(255) NOT NULL,
    rol INT NOT NULL CHECK (rol IN (0,1)),
    estado BOOLEAN DEFAULT TRUE
);

/*==============================================================
TABLA PRODUCTO
precioCompra = costo al proveedor
precioVenta  = precio al cliente final
==============================================================*/
CREATE TABLE Producto (
    idProducto INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precioCompra INT NOT NULL CHECK (precioCompra >= 0),
    precioVenta INT NOT NULL CHECK (precioVenta >= 0),
    disponible BOOLEAN DEFAULT TRUE
);

/*==============================================================
TABLA CARRITO
0 = Activo (carrito actual del cliente)
1 = Convertido (ya generó pedido)
==============================================================*/
CREATE TABLE Carrito (
    idCarrito INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idUsuario INT NOT NULL,
    estado INT DEFAULT 0 CHECK (estado IN (0,1)),
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (idUsuario)
    REFERENCES Usuario(idUsuario)
);

/*==============================================================
TABLA ITEMCARRITO
Guarda productos dentro del carrito

precioUnitario:
Se guarda histórico del precio al momento de compra.
Si mañana cambia el precio del producto,
este registro conserva el valor original.
==============================================================*/
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



/*==============================================================
TABLA PEDIDO
0 = Pendiente
1 = Pagado
2 = Eliminado
==============================================================*/
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

/*==============================================================
TABLA PAGO
0 = No validado
1 = Validado
==============================================================*/
CREATE TABLE Pago (
    idPago INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idPedido INT UNIQUE NOT NULL,
    /*0-Efectivo, 1-Tranferencia, 2-Otro*/
    metodoPago INT DEFAULT 0 CHECK (metodoPago IN (0,1,2)),
    estadoValidacion INT DEFAULT 0 CHECK (estadoValidacion IN (0,1)),

    FOREIGN KEY (idPedido)
    REFERENCES Pedido(idPedido)
);



/*==============================================================
RESTRICCIÓN IMPORTANTE
Solo 1 carrito activo por usuario
==============================================================*/
CREATE UNIQUE INDEX idx_unico_carrito_activo
ON Carrito(idUsuario)
WHERE estado = 0;



/*==============================================================
==============================================================
TRIGGER #1
AUTOLLENAR PRECIO UNITARIO
==============================================================
Cuando insertan un ItemCarrito:

INSERT INTO ItemCarrito(idCarrito,idProducto,cantidad)

El sistema busca automáticamente el precioVenta
del producto y lo guarda en precioUnitario
==============================================================*/
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





/*==============================================================
TRIGGER #2
PROCESAR COMPRA AUTOMÁTICA
==============================================================

Cuando el carrito cambia:

estado 0 -> 1

Significa:
"El usuario confirmó compra"

Entonces el sistema hace SOLO:

1. Calcula total del carrito
2. Crea Pedido automáticamente
3. Crea nuevo carrito vacío activo

==============================================================*/
CREATE OR REPLACE FUNCTION fn_procesar_compra()
RETURNS TRIGGER AS
$$
DECLARE
    v_total INT;
BEGIN

    /* Solo si pasa de activo a convertido */
    IF OLD.estado = 0 AND NEW.estado = 1 THEN

        /* Sumar productos del carrito */
        SELECT COALESCE(SUM(cantidad * precioUnitario),0)
        INTO v_total
        FROM ItemCarrito
        WHERE idCarrito = NEW.idCarrito;


        /* Crear pedido automático */
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


        /* Crear nuevo carrito activo */
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





/*==============================================================
TRIGGER #3
VALIDACIÓN DE PAGO AUTOMÁTICA
==============================================================

Cuando Pago cambia:

estadoValidacion 0 -> 1

El sistema marca Pedido como Pagado

==============================================================*/
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





/*==============================================================
==============================================================
DATOS DE PRUEBA
==============================================================*/

/*ID de Usuario creado
Cliente:
SELECT idUsuario FROM Usuario WHERE (nombre='X' or email='Y') and rol=1;
Admin: 
SELECT idUsuario FROM Usuario WHERE (nombre='X' or email='Y') and rol=0*/

/* Insertar Usuarios*/
INSERT INTO Usuario(nombre,email,claveHash,rol)
/*Cliente*/
VALUES ('Juan','juan@gmail.com','hash',1),
/*Admin*/
('Felipe','felipe@gmail.com','hash',0);

/* Insertar Productos */
INSERT INTO Producto(nombre,precioCompra,precioVenta)
VALUES
('Netflix Premium',12000,18000),
('Spotify Familiar',5000,9000),
('Disney Plus',7000,12000);

/*Mostrar productos actuales
SELECT * FROM Producto;*/

/*Mostrar nombre y precioVenta de productos coincidentes con busqueda
SELECT nombre,precioVenta FROM Producto WHERE nombre ILIKE '%net%' AND precioVenta BETWEEN 10000 AND 20000 AND disponible = TRUE;*/

SELECT nombre,precioVenta, disponible FROM Producto WHERE nombre ILIKE '%c%' AND precioVenta BETWEEN 10000 AND 20000 AND disponible = TRUE;*/


/* Crear carrito inicial del usuario */
INSERT INTO Carrito(idUsuario)
VALUES (1);

/*Numero del carrito actual (activo=0) del cliente
SELECT idCarrito FROM Carrito WHERE idUsuario=X and estado=0;*/


/*==============================================================
==============================================================
FLUJO REAL DEL SISTEMA
==============================================================*/


/*==============================================================
1. Agregar productos al carrito
NO se escribe precioUnitario
Lo llena trigger #1
==============================================================*/

/*Conocer el idProducto por su nombre
SELECT idProducto FROM Producto WHERE nombre='X';*/

INSERT INTO ItemCarrito(idCarrito,idProducto,cantidad)
VALUES
(1,1,1),
(1,2,2);

/*Items del carrito consultado
SELECT ic.idItem, p.nombre, p.precioVenta, ic.cantidad FROM ItemCarrito ic 
JOIN Producto p
ON p.idProducto=ic.idProducto
WHERE idCarrito=X;*/

/*==============================================================
2. Ver carrito actual
==============================================================*/
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

/*==============================================================
3. Usuario da clic en PAGAR

Solo esta línea activa todo:

✔ calcula total
✔ crea pedido
✔ crea carrito nuevo
==============================================================*/
UPDATE Carrito
SET estado = 1
WHERE idCarrito = 1;

/*==============================================================
4. Ver pedidos generados
==============================================================*/
SELECT * FROM Pedido;

/*==============================================================
5. Registrar pago del pedido
==============================================================*/
INSERT INTO Pago(idPedido)
VALUES (1);

/*==============================================================
6. Validar pago (admin)

Solo esta línea hace:

✔ Pedido pasa a PAGADO
==============================================================*/
UPDATE Pago
SET estadoValidacion = 1
WHERE idPedido = 1;

/*==============================================================
CONSULTAS ÚTILES CLIENTE
==============================================================*/

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

/*==============================================================
VER PRODUCTOS DE UN PEDIDO
==============================================================*/
SELECT
    ic.idItem,
    p.nombre,
    ic.cantidad,
    ic.precioUnitario
    ic.cantidad * ic.precioUnitario AS subtotal,
    SUM(ic.cantidad * ic.precioUnitario) OVER () AS total,
    
FROM Pedido pe
JOIN ItemCarrito ic
ON pe.idCarrito = ic.idCarrito
JOIN Producto p
ON p.idProducto = ic.idProducto
/*
Debe tener el ID carrito la tabla Pago para relacionar que sea el pedido correcto.
JOIN Pago pa
ON pa.idpago=*/
WHERE pe.idPedido = 1;

/*==============================================================
RESUMEN AUTOMATIZACIÓN

Agregar producto:
INSERT ItemCarrito

Comprar:
UPDATE Carrito estado=1

Validar pago:
UPDATE Pago estadoValidacion=1

==============================================================*/