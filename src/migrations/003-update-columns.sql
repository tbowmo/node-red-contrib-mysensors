-- UP

ALTER TABLE node RENAME TO tmp_node;

CREATE TABLE IF NOT EXISTS node (
            nodeId integer PRIMARY KEY AUTOINCREMENT,
            label varchar,
            sketchName varchar,
            sketchVersion varchar,
            lastHeard timestamp,
            parentId integer,
            lastRestart timestamp,
            used boolean
);

INSERT INTO node(nodeId, label, sketchName, sketchVersion, lastHeard, parentId, lastRestart, used)
SELECT id, label, sketchName, sketchVersion, lastHeard, parentId, lastRestart, used
FROM tmp_node;

drop table tmp_node;

drop table child;

CREATE TABLE IF NOT EXISTS child (
            nodeId integer,
            childId integer,
            sType integer,
            description varchar,
            lastHeard timestamp,
            PRIMARY KEY(nodeId, childId),
            FOREIGN KEY(nodeId) REFERENCES node(nodeId));


-- DOWN
