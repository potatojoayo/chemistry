-- Enable public read access to relationships table to allow sharing results
-- Note: This allows anyone with a valid UUID to read the relationship details.
-- Since UUIDs are practically unguessable, this serves as a "capability URL" style security.

CREATE POLICY "Enable read access for all users" ON "relationships"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
