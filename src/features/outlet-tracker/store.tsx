"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { EMPTY_ADD_FORM, makeEmptyAvForm, makeEmptyVisitItem } from "./constants";
import type {
  IdentityForm,
  Outlet,
  OutletForm,
  TrackerState,
  Visit,
} from "./types";
import { digits, parseVisitItems, visitTotals } from "./utils";
import { useT } from "@/features/i18n";

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  headQuarter: string;
  area: string;
  role: "admin" | "SO" | "ISR";
}

function initialState(user: SessionUser): TrackerState {
  return {
    screen: "dashboard",
    repMobile: user.phone,
    outlets: [],
    loading: true,
    toast: "",
    dashSearch: "",
    selectedOutletId: null,
    editingIdentity: false,
    editForm: {},
    addStep: 1,
    addForm: { ...EMPTY_ADD_FORM },
    addDuplicateOutletId: null,
    addGpsStatus: "idle",
    addGpsErrorMsg: "",
    avMobile: "",
    avStep: 1,
    avForm: makeEmptyAvForm(),
    editVisitOutletId: null,
    editVisitId: null,
    editVisitForm: makeEmptyAvForm(),
  };
}

type Patch = Partial<TrackerState> | ((s: TrackerState) => Partial<TrackerState>);
type InputEvt = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

async function postJson(url: string, body: unknown, method = "POST") {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data } as { ok: boolean; data: Record<string, unknown> };
}

function useTrackerStore(user: SessionUser) {
  const { t } = useT();
  const [state, setFull] = useState<TrackerState>(() => initialState(user));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest state, so async handlers read fresh form values without re-binding.
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback((patch: Patch) => {
    setFull((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch),
    }));
  }, []);

  const showToast = useCallback(
    (msg: string) => {
      setState({ toast: msg });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setState({ toast: "" }), 2200);
    },
    [setState],
  );

  const refresh = useCallback(async () => {
    const res = await fetch("/api/outlets", { cache: "no-store" });
    if (!res.ok) {
      setState({ loading: false });
      return;
    }
    const data = (await res.json()) as { outlets: Outlet[] };
    setState({ outlets: data.outlets ?? [], loading: false });
  }, [setState]);

  // Merge a single outlet returned by a mutation into local state, so we don't
  // re-fetch the whole dataset from Azure after every action.
  const upsertOutlet = useCallback(
    (outlet: Outlet) =>
      setState((s) => ({
        outlets: s.outlets.some((o) => o.id === outlet.id)
          ? s.outlets.map((o) => (o.id === outlet.id ? outlet : o))
          : [...s.outlets, outlet],
      })),
    [setState],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openOutlet = useCallback(
    (id: string) =>
      setState({
        selectedOutletId: id,
        screen: "outletDetail",
        editingIdentity: false,
      }),
    [setState],
  );

  // ---------- NAV ----------
  const onGoDashboard = () => setState({ screen: "dashboard" });
  const onBack = () =>
    setState((s) => {
      switch (s.screen) {
        case "outletDetail":
        case "addVisitFind":
        case "editVisit":
          return { screen: "dashboard" };
        case "addOutlet":
          return { screen: "dashboard", addStep: 1, addForm: { ...EMPTY_ADD_FORM } };
        case "addVisit":
          return { screen: "addVisitFind", avStep: 1 };
        default:
          return { screen: "dashboard" };
      }
    });

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // ---------- DASHBOARD ----------
  const onDashSearchChange = (e: InputEvt) =>
    setState({ dashSearch: e.target.value });
  const onStartAddOutlet = () =>
    setState({
      screen: "addOutlet",
      addStep: 1,
      // Prefill Head Quarter and Area with the rep's own.
      addForm: {
        ...EMPTY_ADD_FORM,
        headQuarter: user.headQuarter,
        area: user.area,
      },
      addDuplicateOutletId: null,
      addGpsStatus: "idle",
    });
  const onStartAddVisit = () =>
    setState({ screen: "addVisitFind", avMobile: "" });

  // ---------- EDIT VISIT (within 24h) ----------
  const onOpenEditVisit = (outletId: string, visit: Visit) =>
    setState({
      screen: "editVisit",
      editVisitOutletId: outletId,
      editVisitId: visit.id,
      editVisitForm: {
        competitor: visit.competitor,
        competitorBrand: visit.competitorBrand,
        remarks: visit.remarks,
        items: visit.items.length
          ? visit.items.map((it) => ({
              segment: it.segment,
              stock: String(it.stock),
              sold: String(it.sold),
              rank: String(it.rank),
            }))
          : [makeEmptyVisitItem()],
      },
    });
  const setEditVisit = (patch: Partial<OutletForm>) =>
    setState((s) => ({ editVisitForm: { ...s.editVisitForm, ...patch } }));
  const saveEditVisit = async () => {
    const f = stateRef.current.editVisitForm;
    const id = stateRef.current.editVisitId;
    if (!id) return;
    const { ok, data } = await postJson(`/api/visits/${id}`, f, "PATCH");
    if (!ok) {
      showToast(String(data.error ?? t("toast.couldNotUpdateVisit")));
      return;
    }
    // Apply the edit locally (the PATCH returns only { ok }).
    const items = parseVisitItems(f.items ?? []);
    const totals = visitTotals(items);
    setState((s) => ({
      outlets: s.outlets.map((o) =>
        o.id !== s.editVisitOutletId
          ? o
          : {
              ...o,
              visits: o.visits.map((v) =>
                v.id !== s.editVisitId
                  ? v
                  : {
                      ...v,
                      items,
                      stock: totals.stock,
                      sold: totals.sold,
                      rank: totals.rank,
                      competitor: f.competitor ?? "",
                      competitorBrand: f.competitorBrand ?? "",
                      remarks: f.remarks ?? "",
                    },
              ),
            },
      ),
      screen: "dashboard",
    }));
    showToast(t("toast.visitUpdated"));
  };

  // ---------- OUTLET DETAIL / EDIT IDENTITY ----------
  const onEditIdentity = () =>
    setState((s) => {
      const o = s.outlets.find((x) => x.id === s.selectedOutletId);
      if (!o) return {};
      return {
        editingIdentity: true,
        editForm: {
          name: o.name,
          mobile: o.mobile,
          address: o.address,
          area: o.area,
          headQuarter: o.headQuarter,
          type: o.type,
          typeOther: o.typeOther,
        },
      };
    });
  const onCancelEditIdentity = () => setState({ editingIdentity: false });
  const setEditIdentity = (patch: Partial<IdentityForm>) =>
    setState((s) => ({ editForm: { ...s.editForm, ...patch } }));
  const saveEditIdentity = async () => {
    const id = stateRef.current.selectedOutletId;
    const f = stateRef.current.editForm;
    if (!id) return;
    const { ok, data } = await postJson(`/api/outlets/${id}`, f, "PATCH");
    if (!ok) {
      showToast(String(data.error ?? t("toast.couldNotSave")));
      return;
    }
    if (data.outlet) upsertOutlet(data.outlet as Outlet);
    setState({ editingIdentity: false });
    showToast(t("toast.outletUpdated"));
  };
  const onAddVisitForSelected = () =>
    setState((s) => {
      const o = s.outlets.find((x) => x.id === s.selectedOutletId);
      if (!o) return {};
      return {
        screen: "addVisit",
        avStep: 1,
        avForm: {
          ...makeEmptyAvForm(),
          name: o.name,
          mobile: o.mobile,
          address: o.address,
          area: o.area,
          headQuarter: o.headQuarter,
          type: o.type,
          typeOther: o.typeOther,
        },
      };
    });

  // ---------- ADD OUTLET ----------
  const setAdd = (patch: Partial<OutletForm>) =>
    setState((s) => ({ addForm: { ...s.addForm, ...patch } }));
  const onAddMobileChange = (e: InputEvt) => {
    const mobile = digits(e.target.value);
    setState((s) => {
      const dup =
        mobile.length === 10 ? s.outlets.find((o) => o.mobile === mobile) : null;
      return {
        addForm: { ...s.addForm, mobile },
        addDuplicateOutletId: dup ? dup.id : null,
      };
    });
  };
  const onAddStep1Next = () => setState({ addStep: 2 });
  const onViewDuplicate = () =>
    setState((s) => ({
      screen: "outletDetail",
      selectedOutletId: s.addDuplicateOutletId,
      addStep: 1,
      addForm: { ...EMPTY_ADD_FORM },
    }));
  const onCaptureGps = () => {
    setState({ addGpsStatus: "capturing" });
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        addGpsStatus: "error",
        addGpsErrorMsg: t("gps.errUnavailable"),
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState((s) => ({
          addGpsStatus: "success",
          addForm: {
            ...s.addForm,
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
          },
        })),
      () =>
        setState({
          addGpsStatus: "error",
          addGpsErrorMsg: t("gps.errDenied"),
        }),
      { timeout: 8000 },
    );
  };
  const onAddStep2Next = () => setState({ addStep: 3 });
  const onAddBack = () =>
    setState((s) => ({ addStep: Math.max(1, s.addStep - 1) }));
  const submitAddOutlet = async () => {
    const f = stateRef.current.addForm;
    const { ok, data } = await postJson("/api/outlets", f);
    if (!ok) {
      showToast(String(data.error ?? t("toast.couldNotAddOutlet")));
      return;
    }
    const created = data.outlet as Outlet | undefined;
    if (created) upsertOutlet(created);
    setState({
      screen: created ? "outletDetail" : "dashboard",
      selectedOutletId: created ? created.id : null,
      addStep: 1,
      addForm: { ...EMPTY_ADD_FORM },
      addGpsStatus: "idle",
    });
    showToast(t("toast.outletAdded"));
  };

  // ---------- ADD VISIT ----------
  const setAv = (patch: Partial<OutletForm>) =>
    setState((s) => ({ avForm: { ...s.avForm, ...patch } }));
  const onAvMobileChange = (e: InputEvt) =>
    setState({ avMobile: digits(e.target.value) });
  const onAvSelectOutlet = (id: string) =>
    setState((s) => {
      const o = s.outlets.find((x) => x.id === id);
      if (!o) return {};
      return {
        screen: "addVisit",
        avStep: 1,
        selectedOutletId: id,
        avForm: {
          ...makeEmptyAvForm(),
          name: o.name,
          mobile: o.mobile,
          address: o.address,
          area: o.area,
          headQuarter: o.headQuarter,
          type: o.type,
          typeOther: o.typeOther,
        },
      };
    });
  const onAvGoAddOutlet = () =>
    setState((s) => ({
      screen: "addOutlet",
      addStep: 1,
      addForm: {
        ...EMPTY_ADD_FORM,
        mobile: s.avMobile,
        headQuarter: user.headQuarter,
        area: user.area,
      },
      addDuplicateOutletId: null,
      addGpsStatus: "idle",
    }));
  const onAvNext = () => setState({ avStep: 2 });
  const onAvBack = () =>
    setState((s) =>
      s.avStep > 1 ? { avStep: s.avStep - 1 } : { screen: "addVisitFind" },
    );
  const submitVisit = async () => {
    const id = stateRef.current.selectedOutletId;
    const f = stateRef.current.avForm;
    if (!id) return;
    const { ok, data } = await postJson(`/api/outlets/${id}/visits`, f);
    if (!ok) {
      showToast(String(data.error ?? t("toast.couldNotRecordVisit")));
      return;
    }
    if (data.outlet) upsertOutlet(data.outlet as Outlet);
    setState({ screen: "outletDetail", avStep: 1, avForm: makeEmptyAvForm() });
    showToast(t("toast.visitRecorded"));
  };

  return {
    user,
    state,
    refresh,
    openOutlet,
    onGoDashboard,
    onBack,
    onLogout,
    onDashSearchChange,
    onStartAddOutlet,
    onStartAddVisit,
    onOpenEditVisit,
    setEditVisit,
    saveEditVisit,
    onEditIdentity,
    onCancelEditIdentity,
    setEditIdentity,
    saveEditIdentity,
    onAddVisitForSelected,
    setAdd,
    onAddMobileChange,
    onAddStep1Next,
    onAddStep2Next,
    onAddBack,
    onViewDuplicate,
    onCaptureGps,
    submitAddOutlet,
    setAv,
    onAvMobileChange,
    onAvSelectOutlet,
    onAvGoAddOutlet,
    onAvNext,
    onAvBack,
    submitVisit,
  };
}

type TrackerContextValue = ReturnType<typeof useTrackerStore>;

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const store = useTrackerStore(user);
  const value = useMemo(() => store, [store]);
  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  );
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used within a TrackerProvider");
  return ctx;
}
