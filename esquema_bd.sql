--
-- PostgreSQL database dump
--

\restrict hjHe0fie1pg9DtJMxaSRwfeY2OGr7nfIAvX5wSHCKRrdROfCUrGUHwrkVhjaTcq

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: inscripciones; Type: TABLE; Schema: public; Owner: fitzone
--

CREATE TABLE public.inscripciones (
    id bigint NOT NULL,
    usuario_id integer NOT NULL,
    sede_id integer NOT NULL,
    plan_id integer NOT NULL,
    precio_mensual numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'aprobada'::character varying NOT NULL,
    fecha_solicitud timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT inscripciones_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying, 'cancelada'::character varying])::text[])))
);


ALTER TABLE public.inscripciones OWNER TO fitzone;

--
-- Name: inscripciones_id_seq; Type: SEQUENCE; Schema: public; Owner: fitzone
--

CREATE SEQUENCE public.inscripciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inscripciones_id_seq OWNER TO fitzone;

--
-- Name: inscripciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fitzone
--

ALTER SEQUENCE public.inscripciones_id_seq OWNED BY public.inscripciones.id;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: fitzone
--

CREATE TABLE public.pagos (
    id_pago integer NOT NULL,
    id_usuario integer NOT NULL,
    plan character varying(50) NOT NULL,
    monto numeric(10,2) NOT NULL,
    franquicia character varying(20) NOT NULL,
    ultimos_digitos character varying(4) NOT NULL,
    codigo_autorizacion character varying(30) NOT NULL,
    estado character varying(20) DEFAULT 'APROBADO'::character varying,
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pagos OWNER TO fitzone;

--
-- Name: pagos_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: fitzone
--

CREATE SEQUENCE public.pagos_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_id_pago_seq OWNER TO fitzone;

--
-- Name: pagos_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fitzone
--

ALTER SEQUENCE public.pagos_id_pago_seq OWNED BY public.pagos.id_pago;


--
-- Name: planes; Type: TABLE; Schema: public; Owner: fitzone
--

CREATE TABLE public.planes (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    precio numeric(10,2) NOT NULL,
    codigo character varying(40)
);


ALTER TABLE public.planes OWNER TO fitzone;

--
-- Name: planes_id_seq; Type: SEQUENCE; Schema: public; Owner: fitzone
--

CREATE SEQUENCE public.planes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planes_id_seq OWNER TO fitzone;

--
-- Name: planes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fitzone
--

ALTER SEQUENCE public.planes_id_seq OWNED BY public.planes.id;


--
-- Name: rutinas_ia; Type: TABLE; Schema: public; Owner: fitzone
--

CREATE TABLE public.rutinas_ia (
    id_rutina integer NOT NULL,
    id_usuario integer NOT NULL,
    objetivo character varying(100) NOT NULL,
    respuesta_ia text NOT NULL,
    fecha_generacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rutinas_ia OWNER TO fitzone;

--
-- Name: rutinas_ia_id_rutina_seq; Type: SEQUENCE; Schema: public; Owner: fitzone
--

CREATE SEQUENCE public.rutinas_ia_id_rutina_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rutinas_ia_id_rutina_seq OWNER TO fitzone;

--
-- Name: rutinas_ia_id_rutina_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fitzone
--

ALTER SEQUENCE public.rutinas_ia_id_rutina_seq OWNED BY public.rutinas_ia.id_rutina;


--
-- Name: sedes; Type: TABLE; Schema: public; Owner: fitzone
--

CREATE TABLE public.sedes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    ubicacion character varying(200) NOT NULL,
    codigo character varying(40)
);


ALTER TABLE public.sedes OWNER TO fitzone;

--
-- Name: sedes_id_seq; Type: SEQUENCE; Schema: public; Owner: fitzone
--

CREATE SEQUENCE public.sedes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sedes_id_seq OWNER TO fitzone;

--
-- Name: sedes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fitzone
--

ALTER SEQUENCE public.sedes_id_seq OWNED BY public.sedes.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: fitzone
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    contrasena character varying(255) NOT NULL,
    rol character varying(20) DEFAULT 'cliente'::character varying NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO fitzone;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: fitzone
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO fitzone;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fitzone
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: inscripciones id; Type: DEFAULT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.inscripciones ALTER COLUMN id SET DEFAULT nextval('public.inscripciones_id_seq'::regclass);


--
-- Name: pagos id_pago; Type: DEFAULT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.pagos ALTER COLUMN id_pago SET DEFAULT nextval('public.pagos_id_pago_seq'::regclass);


--
-- Name: planes id; Type: DEFAULT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.planes ALTER COLUMN id SET DEFAULT nextval('public.planes_id_seq'::regclass);


--
-- Name: rutinas_ia id_rutina; Type: DEFAULT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.rutinas_ia ALTER COLUMN id_rutina SET DEFAULT nextval('public.rutinas_ia_id_rutina_seq'::regclass);


--
-- Name: sedes id; Type: DEFAULT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.sedes ALTER COLUMN id SET DEFAULT nextval('public.sedes_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: inscripciones inscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_pkey PRIMARY KEY (id);


--
-- Name: pagos pagos_codigo_autorizacion_key; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_codigo_autorizacion_key UNIQUE (codigo_autorizacion);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id_pago);


--
-- Name: planes planes_pkey; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.planes
    ADD CONSTRAINT planes_pkey PRIMARY KEY (id);


--
-- Name: rutinas_ia rutinas_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.rutinas_ia
    ADD CONSTRAINT rutinas_ia_pkey PRIMARY KEY (id_rutina);


--
-- Name: sedes sedes_pkey; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: uq_inscripcion_aprobada; Type: INDEX; Schema: public; Owner: fitzone
--

CREATE UNIQUE INDEX uq_inscripcion_aprobada ON public.inscripciones USING btree (usuario_id, sede_id, plan_id) WHERE ((estado)::text = 'aprobada'::text);


--
-- Name: uq_inscripcion_pendiente; Type: INDEX; Schema: public; Owner: fitzone
--

CREATE UNIQUE INDEX uq_inscripcion_pendiente ON public.inscripciones USING btree (usuario_id, sede_id, plan_id) WHERE ((estado)::text = 'pendiente'::text);


--
-- Name: uq_planes_codigo; Type: INDEX; Schema: public; Owner: fitzone
--

CREATE UNIQUE INDEX uq_planes_codigo ON public.planes USING btree (codigo);


--
-- Name: uq_sedes_codigo; Type: INDEX; Schema: public; Owner: fitzone
--

CREATE UNIQUE INDEX uq_sedes_codigo ON public.sedes USING btree (codigo);


--
-- Name: inscripciones inscripciones_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.planes(id);


--
-- Name: inscripciones inscripciones_sede_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_sede_id_fkey FOREIGN KEY (sede_id) REFERENCES public.sedes(id);


--
-- Name: inscripciones inscripciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: pagos pagos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: rutinas_ia rutinas_ia_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitzone
--

ALTER TABLE ONLY public.rutinas_ia
    ADD CONSTRAINT rutinas_ia_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hjHe0fie1pg9DtJMxaSRwfeY2OGr7nfIAvX5wSHCKRrdROfCUrGUHwrkVhjaTcq

