import {
    Coordinator,
    EventLoggingStrategy,
    LogTruncationStrategy,
    SyncStrategy,
} from "@orbit/coordinator";
import {IndexedDBSource} from "@orbit/indexeddb";
import {IndexedDBBucket} from "@orbit/indexeddb-bucket";
import {MemorySource} from "@orbit/memory";
import {InitializedRecord, RecordSchema} from "@orbit/records";

import {maybeLoadFakeData} from "./fakeData";

export interface Note extends InitializedRecord {
    type: "note";
    attributes: {
        title: string;
        content: string;
        created_at: Date;
        updated_at: Date;
    };
}

let coordinator: Coordinator | undefined;

export const getCoordinator = async () => {
    if (coordinator != null) {
        return coordinator;
    }

    const schema = new RecordSchema({
        models: {
            note: {
                attributes: {
                    title: {type: "string"},
                    content: {type: "string"},
                    created_at: {type: "datetime"},
                    updated_at: {type: "datetime"},
                },
            },
        },
    });

    const bucket = new IndexedDBBucket();

    const memory = new MemorySource({schema, bucket});

    const indexeddb = new IndexedDBSource({schema, bucket});

    coordinator = new Coordinator({
        sources: [memory, indexeddb],
    });

    const memoryIndexeddbSync = new SyncStrategy({
        source: "memory",
        target: "indexeddb",
    });

    coordinator.addStrategy(memoryIndexeddbSync);

    const logTruncationStrategy = new LogTruncationStrategy();

    coordinator.addStrategy(logTruncationStrategy);

    const eventLoggingStrategy = new EventLoggingStrategy();

    coordinator.addStrategy(eventLoggingStrategy);

    try {
        console.log("Memory source: hydrating...");
        const allRecords = await indexeddb.query<Note[]>((q) =>
            q.findRecords(),
        );
        await memory.sync((t) => allRecords.map((r) => t.addRecord(r)));
        console.log("Memory source: hydration success.");
    } catch (error) {
        console.error("Memory source: hydration error.");
        throw error;
    }

    try {
        console.log("Coordinator: activating...");
        await coordinator.activate();
        console.log("Coordinator: activation success.");
    } catch (error) {
        console.error("Coordinator: activation error.");
        throw error;
    }

    await maybeLoadFakeData(coordinator);

    // @ts-expect-error for testing purposes
    window.coordinator = coordinator;

    return coordinator;
};
