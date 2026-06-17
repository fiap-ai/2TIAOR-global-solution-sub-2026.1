-- TerraVista — Supabase schema for IoT sensor persistence.
-- Run this in the Supabase SQL Editor (project → SQL Editor → New query).
-- Author: Gabriel Mule (RM 560586)

create table if not exists public.sensor_readings (
    id              bigint generated always as identity primary key,
    air_temperature double precision not null,
    air_humidity    double precision not null,
    soil_moisture   double precision not null,
    solar_radiation double precision not null,
    ndvi            double precision not null,
    days_since_rain double precision not null default 0,
    wind_speed      double precision not null default 0,
    device_id       text not null default 'esp32-terravista-01',
    risk_class      smallint not null,         -- 0=HEALTHY, 1=ATTENTION, 2=CRITICAL
    risk_label      text not null,
    timestamp       timestamptz not null default now()
);

-- Fast "latest readings" queries for the dashboards.
create index if not exists sensor_readings_timestamp_idx
    on public.sensor_readings (timestamp desc);

-- The backend uses the service_role key, which bypasses RLS. We still enable
-- RLS so the anon/public key cannot read or write the table directly.
alter table public.sensor_readings enable row level security;

-- Grant table privileges to the backend role (service_role bypasses RLS but
-- still needs table-level grants). Run this if you get "permission denied".
grant select, insert, delete on public.sensor_readings to service_role;
grant usage, select on sequence public.sensor_readings_id_seq to service_role;

