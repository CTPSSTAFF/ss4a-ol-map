-- Table: public.ctps_all_mapc_towns

-- DROP TABLE IF EXISTS public.ctps_all_mapc_towns;

CREATE TABLE IF NOT EXISTS public.ctps_all_mapc_towns
(
    objectid integer NOT NULL,
    town_id smallint,
    town character varying(21) COLLATE pg_catalog."default",
    fips_stco integer,
    pop1980 integer,
    pop1990 integer,
    pop2000 integer,
    pop2010 integer,
    popch80_90 integer,
    popch90_00 integer,
    popch00_10 integer,
    fourcolor smallint,
    type character varying(2) COLLATE pg_catalog."default",
    num_polygons integer,
    objectid_1 integer,
    town_id_1 integer,
    town_1 character varying(21) COLLATE pg_catalog."default",
    county character varying(12) COLLATE pg_catalog."default",
    code character varying(1) COLLATE pg_catalog."default",
    region character varying(1) COLLATE pg_catalog."default",
    rpa character varying(10) COLLATE pg_catalog."default",
    mapc_sub character varying(40) COLLATE pg_catalog."default",
    rta character varying(10) COLLATE pg_catalog."default",
    district smallint,
    fips_mcd numeric(38,8),
    fip_county integer,
    ccd_mcd character varying(3) COLLATE pg_catalog."default",
    fips_place character varying(5) COLLATE pg_catalog."default",
    gdb_geomattr_data bytea,
    shape geometry,
    CONSTRAINT enforce_srid_shape CHECK (st_srid(shape) = 26986)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ctps_all_mapc_towns
    OWNER to gisadmin;

REVOKE ALL ON TABLE public.ctps_all_mapc_towns FROM gispublisher;

GRANT ALL ON TABLE public.ctps_all_mapc_towns TO gisadmin;

GRANT SELECT ON TABLE public.ctps_all_mapc_towns TO gispublisher;

-- Index: a2108_ix1

-- DROP INDEX IF EXISTS public.a2108_ix1;

CREATE INDEX IF NOT EXISTS a2108_ix1
    ON public.ctps_all_mapc_towns USING gist
    (shape)
    TABLESPACE pg_default;
-- Index: r2548_sde_rowid_uk

-- DROP INDEX IF EXISTS public.r2548_sde_rowid_uk;

CREATE UNIQUE INDEX IF NOT EXISTS r2548_sde_rowid_uk
    ON public.ctps_all_mapc_towns USING btree
    (objectid ASC NULLS LAST)
    WITH (FILLFACTOR=75)
    TABLESPACE pg_default;