-- UP
CREATE TABLE IF NOT EXISTS node (
            id integer PRIMARY KEY AUTOINCREMENT,
            label varchar,
            sketchName varchar,
            sketchVersion varchar,
            lastHeard timestamp,
            parentId integer,
            lastRestart timestamp,
            used boolean
);

CREATE TABLE IF NOT EXISTS child (
            id integer,
            nodeId integer,
            sType integer,
            lastHeard timestamp);

-- Down
drop TABLE node;
drop TABLE child;