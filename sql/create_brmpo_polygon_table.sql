-- Table: public.ctps_brmpo_boundary_poly

-- DROP TABLE IF EXISTS public.ctps_brmpo_boundary_poly;

CREATE TABLE IF NOT EXISTS public.ctps_brmpo_boundary_poly
(
    objectid integer NOT NULL,
    gdb_geomattr_data bytea,
    shape geometry,
    CONSTRAINT enforce_srid_shape CHECK (st_srid(shape) = 26986)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ctps_brmpo_boundary_poly
    OWNER to gisadmin;

REVOKE ALL ON TABLE public.ctps_brmpo_boundary_poly FROM gispublisher;

GRANT ALL ON TABLE public.ctps_brmpo_boundary_poly TO gisadmin;

GRANT SELECT ON TABLE public.ctps_brmpo_boundary_poly TO gispublisher;


-- Index: a2095_ix1

-- DROP INDEX IF EXISTS public.a2095_ix1;

CREATE INDEX IF NOT EXISTS a2095_ix1
    ON public.ctps_brmpo_boundary_poly USING gist
    (shape)
    TABLESPACE pg_default;
-- Index: r2535_sde_rowid_uk

-- DROP INDEX IF EXISTS public.r2535_sde_rowid_uk;

CREATE UNIQUE INDEX IF NOT EXISTS r2535_sde_rowid_uk
    ON public.ctps_brmpo_boundary_poly USING btree
    (objectid ASC NULLS LAST)
    WITH (FILLFACTOR=75)
    TABLESPACE pg_default;