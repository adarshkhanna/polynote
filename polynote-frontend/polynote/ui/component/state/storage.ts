import {storage} from "../../util/storage";
import {StateHandler} from "./state_handler";

export type RecentNotebooks = {name: string, path: string}[];
export type NotebookLocations = Record<string, number>;
export interface ViewPreferences {
    leftPane: {
        size: string,
        collapsed: boolean
    },
    rightPane: {
        size: string,
        collapsed: boolean
    },
}
export type Preference<T> = {name: string, value: T, description: string}
export interface UserPreferences {
    vim: Preference<boolean>,
    notifications: Preference<boolean>,
    // theme: Preference<"Light" | "Dark">
}

export class LocalStorageHandler<T> extends StateHandler<T> {
    constructor(readonly key: string, private initial: T) {
        super(initial);

        // watch storage to detect when it was cleared
        storage.addStorageListener(this.key, (prev, next) => {
            if (next === null) { // cleared
                this.setState(initial)
            } // we don't do anything else because storage shouldn't change underneath us.
        })
    }
    getState(): T {
        const recent = storage.get(this.key);
        if (recent) {
            return recent;
        } else {
            this.setState(this.initial);
            return this.initial;
        }
    }

    setState(s: T) {
        super.setState(s);
        storage.set(this.key, s)
    }
}

export function clearStorage() {
    storage.clear()
    location.reload();
}

export const RecentNotebooksHandler = new LocalStorageHandler<RecentNotebooks>("RecentNotebooks", []);
export const NotebookLocationsHandler = new LocalStorageHandler<NotebookLocations>("NotebookLocations", {});
export const ViewPrefsHandler = new LocalStorageHandler<ViewPreferences>("ViewPreferences", {
    leftPane: {
        size: '300px',
        collapsed: false,
    },
    rightPane: {
        size: '300px',
        collapsed: false,
    }
});
export const UserPreferences = new LocalStorageHandler<UserPreferences>("UserPreferences", {
    vim: {name: "VIM", value: false, description: "Whether VIM input mode is enabled for Code cells"},
    notifications: {
        name: "Notifications",
        value: false,
        description: "Whether to allow Polynote to send you browser notifications. " +
            "Toggling this to `true` for the first time will prompt your browser to request your permission."},
    // theme: {}
})