
-- traits table
CREATE TABLE traits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  trait_type TEXT NOT NULL,
  rarity INTEGER NOT NULL DEFAULT 1,
  parent_trait_id INTEGER REFERENCES traits(id),
  image_path TEXT
);

-- snails table
CREATE TABLE snails (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  body_color_id INTEGER REFERENCES traits(id),
  body_outline_id INTEGER REFERENCES traits(id),
  mouth_id INTEGER REFERENCES traits(id),
  eyes_pupil_id INTEGER REFERENCES traits(id),
  eyes_acc_id INTEGER REFERENCES traits(id),
  shell_outline_id INTEGER REFERENCES traits(id),
  shell_color_id INTEGER REFERENCES traits(id),
  shell_shading_id INTEGER REFERENCES traits(id),
  shell_acc_id INTEGER REFERENCES traits(id),
  acc_id INTEGER REFERENCES traits(id),
  speed FLOAT,
  slimeiness FLOAT,
  charisma FLOAT,
  genetic_traits JSONB,
  parent1_id INTEGER REFERENCES snails(id),
  parent2_id INTEGER REFERENCES snails(id),
  generation INTEGER DEFAULT 1,
  lineage INTEGER[]
);
