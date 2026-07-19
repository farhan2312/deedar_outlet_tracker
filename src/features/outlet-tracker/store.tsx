"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  DEMO_PASSWORD,
  EMPTY_ADD_FORM,
  EMPTY_RV_FORM,
} from "./constants";
import { SAMPLE_OUTLETS } from "./sample-data";
import type {
  CompetitorLevel,
  IdentityForm,
  OutletForm,
  TrackerState,
  Visit,
} from "./types";
import { digits, uid } from "./utils";

const INITIAL: TrackerState = {
  screen: "login",
  authMobile: "",
  authPassword: "",
  authError: "",
  repMobile: "",
  outlets: SAMPLE_OUTLETS,
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
  rvStep: 1,
  rvSearch: "",
  rvForm: { ...EMPTY_RV_FORM },
  editVisitOutletId: null,
  editVisitId: null,
  editVisitForm: { ...EMPTY_RV_FORM },
};

type Patch = Partial<TrackerState> | ((s: TrackerState) => Partial<TrackerState>);
type InputEvt = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

function useTrackerStore() {
  const [state, setFull] = useState<TrackerState>(INITIAL);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const findByMobile = useCallback(
    (mobile: string) => state.outlets.find((o) => o.mobile === mobile),
    [state.outlets],
  );

  const openOutlet = useCallback(
    (id: string) =>
      setState({
        selectedOutletId: id,
        screen: "outletDetail",
        editingIdentity: false,
      }),
    [setState],
  );

  // ---------- LOGIN ----------
  const onAuthMobileChange = (e: InputEvt) =>
    setState({ authMobile: digits(e.target.value) });
  const onAuthPasswordChange = (e: InputEvt) =>
    setState({ authPassword: e.target.value });
  const onLogin = () =>
    setState((s) => {
      if (s.authMobile.length !== 10 || s.authPassword !== DEMO_PASSWORD) {
        return { authError: "Invalid mobile number or password." };
      }
      return { screen: "dashboard", repMobile: s.authMobile, authError: "" };
    });
  const onLogout = () =>
    setState({
      screen: "login",
      authMobile: "",
      authPassword: "",
      authError: "",
    });

  // ---------- NAV ----------
  const onGoDashboard = () => setState({ screen: "dashboard" });
  const onBack = () =>
    setState((s) => {
      switch (s.screen) {
        case "outletDetail":
        case "recordVisitSearch":
        case "editVisit":
          return { screen: "dashboard" };
        case "addOutlet":
          return { screen: "dashboard", addStep: 1, addForm: { ...EMPTY_ADD_FORM } };
        case "recordVisit":
          return { screen: "recordVisitSearch", rvStep: 1 };
        default:
          return { screen: "dashboard" };
      }
    });

  // ---------- DASHBOARD ----------
  const onDashSearchChange = (e: InputEvt) =>
    setState({ dashSearch: e.target.value });
  const onStartAddOutlet = () =>
    setState({
      screen: "addOutlet",
      addStep: 1,
      addForm: { ...EMPTY_ADD_FORM },
      addDuplicateOutletId: null,
      addGpsStatus: "idle",
    });
  const onStartRecordVisit = () =>
    setState({ screen: "recordVisitSearch", rvSearch: "" });

  // ---------- EDIT VISIT (within 24h) ----------
  const onOpenEditVisit = (outletId: string, visit: Visit) =>
    setState({
      screen: "editVisit",
      editVisitOutletId: outletId,
      editVisitId: visit.id,
      editVisitForm: {
        stock: String(visit.stock),
        sold: String(visit.sold),
        rank: String(visit.rank),
        competitor: visit.competitor,
        competitorBrand: visit.competitorBrand,
        remarks: visit.remarks,
      },
    });
  const setEditVisit = (patch: Partial<OutletForm>) =>
    setState((s) => ({ editVisitForm: { ...s.editVisitForm, ...patch } }));
  const onSaveEditVisit = () =>
    setState((s) => {
      const f = s.editVisitForm;
      const outlets = s.outlets.map((o) =>
        o.id !== s.editVisitOutletId
          ? o
          : {
              ...o,
              visits: o.visits.map((v) =>
                v.id !== s.editVisitId
                  ? v
                  : {
                      ...v,
                      stock: Number(f.stock) || 0,
                      sold: Number(f.sold) || 0,
                      rank: Number(f.rank) || 0,
                      competitor: (f.competitor ?? "") as CompetitorLevel | "",
                      competitorBrand: f.competitorBrand ?? "",
                      remarks: f.remarks ?? "",
                    },
              ),
            },
      );
      return { outlets, screen: "dashboard" };
    });
  const saveEditVisit = () => {
    onSaveEditVisit();
    showToast("Visit updated");
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
          poc: o.poc,
          mobile: o.mobile,
          address: o.address,
          town: o.town,
          division: o.division,
          type: o.type,
          typeOther: o.typeOther,
        },
      };
    });
  const onCancelEditIdentity = () => setState({ editingIdentity: false });
  const setEditIdentity = (patch: Partial<IdentityForm>) =>
    setState((s) => ({ editForm: { ...s.editForm, ...patch } }));
  const onSaveEditIdentity = () =>
    setState((s) => {
      const id = s.selectedOutletId;
      const outlets = s.outlets.map((o) =>
        o.id === id ? { ...o, ...s.editForm } : o,
      );
      return { outlets, editingIdentity: false };
    });
  const saveEditIdentity = () => {
    onSaveEditIdentity();
    showToast("Outlet details updated");
  };
  const onRecordVisitForSelected = () =>
    setState((s) => {
      const o = s.outlets.find((x) => x.id === s.selectedOutletId);
      if (!o) return {};
      return {
        screen: "recordVisit",
        rvStep: 1,
        rvForm: {
          ...EMPTY_RV_FORM,
          name: o.name,
          poc: o.poc,
          mobile: o.mobile,
          address: o.address,
          town: o.town,
          division: o.division,
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
      const dup = mobile.length === 10 ? s.outlets.find((o) => o.mobile === mobile) : null;
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
        addGpsErrorMsg:
          "Location services unavailable on this device. Enter coordinates manually.",
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
          addGpsErrorMsg:
            "Location access denied or unavailable. Enter coordinates manually.",
        }),
      { timeout: 8000 },
    );
  };
  const onAddStep2Next = () => setState({ addStep: 3 });
  const onAddStep3Next = () => setState({ addStep: 4 });
  const onAddBack = () =>
    setState((s) => ({ addStep: Math.max(1, s.addStep - 1) }));
  const onSubmitAddOutlet = () =>
    setState((s) => {
      const f = s.addForm;
      const newOutlet = {
        id: uid("OUT"),
        name: f.name,
        poc: f.poc,
        mobile: f.mobile,
        address: f.address,
        town: f.town,
        division: f.division,
        type: f.type,
        typeOther: f.typeOther,
        gps: { lat: f.lat, lng: f.lng },
        visits: [
          {
            id: uid("V"),
            date: new Date().toISOString().slice(0, 10),
            loggedAt: Date.now(),
            stock: Number(f.stock) || 0,
            sold: Number(f.sold) || 0,
            rank: Number(f.rank) || 0,
            competitor: f.competitor,
            competitorBrand: f.competitorBrand,
            remarks: f.remarks,
            rep: s.repMobile,
          },
        ],
      };
      return {
        outlets: [...s.outlets, newOutlet],
        screen: "outletDetail",
        selectedOutletId: newOutlet.id,
        addStep: 1,
        addForm: { ...EMPTY_ADD_FORM },
        addGpsStatus: "idle",
      };
    });
  const submitAddOutlet = () => {
    onSubmitAddOutlet();
    showToast("Outlet added successfully");
  };

  // ---------- RECORD VISIT ----------
  const setRv = (patch: Partial<OutletForm>) =>
    setState((s) => ({ rvForm: { ...s.rvForm, ...patch } }));
  const onRvSearchChange = (e: InputEvt) => setState({ rvSearch: e.target.value });
  const onSelectRvOutlet = (id: string) =>
    setState((s) => {
      const o = s.outlets.find((x) => x.id === id);
      if (!o) return {};
      return {
        screen: "recordVisit",
        rvStep: 1,
        selectedOutletId: id,
        rvForm: {
          ...EMPTY_RV_FORM,
          name: o.name,
          poc: o.poc,
          mobile: o.mobile,
          address: o.address,
          town: o.town,
          division: o.division,
          type: o.type,
          typeOther: o.typeOther,
        },
      };
    });
  const onRvStep1Next = () => setState({ rvStep: 2 });
  const onRvStep2Next = () => setState({ rvStep: 3 });
  const onRvBack = () =>
    setState((s) =>
      s.rvStep > 1 ? { rvStep: s.rvStep - 1 } : { screen: "recordVisitSearch" },
    );
  const onSubmitVisit = () =>
    setState((s) => {
      const f = s.rvForm;
      const id = s.selectedOutletId;
      const newVisit: Visit = {
        id: uid("V"),
        date: new Date().toISOString().slice(0, 10),
        loggedAt: Date.now(),
        stock: Number(f.stock) || 0,
        sold: Number(f.sold) || 0,
        rank: Number(f.rank) || 0,
        competitor: f.competitor,
        competitorBrand: f.competitorBrand,
        remarks: f.remarks,
        rep: s.repMobile,
      };
      const outlets = s.outlets.map((o) =>
        o.id === id
          ? {
              ...o,
              name: f.name,
              poc: f.poc,
              mobile: f.mobile,
              address: f.address,
              town: f.town,
              division: f.division,
              type: f.type,
              typeOther: f.typeOther,
              visits: [...o.visits, newVisit],
            }
          : o,
      );
      return {
        outlets,
        screen: "outletDetail",
        rvStep: 1,
        rvForm: { ...EMPTY_RV_FORM },
      };
    });
  const submitVisit = () => {
    onSubmitVisit();
    showToast("Visit recorded successfully");
  };

  return {
    state,
    // login
    onAuthMobileChange,
    onAuthPasswordChange,
    onLogin,
    onLogout,
    // nav
    onGoDashboard,
    onBack,
    openOutlet,
    // dashboard
    onDashSearchChange,
    onStartAddOutlet,
    onStartRecordVisit,
    // edit visit
    onOpenEditVisit,
    setEditVisit,
    saveEditVisit,
    // edit identity
    onEditIdentity,
    onCancelEditIdentity,
    setEditIdentity,
    saveEditIdentity,
    onRecordVisitForSelected,
    // add outlet
    setAdd,
    onAddMobileChange,
    onAddStep1Next,
    onAddStep2Next,
    onAddStep3Next,
    onAddBack,
    onViewDuplicate,
    onCaptureGps,
    submitAddOutlet,
    findByMobile,
    // record visit
    setRv,
    onRvSearchChange,
    onSelectRvOutlet,
    onRvStep1Next,
    onRvStep2Next,
    onRvBack,
    submitVisit,
  };
}

type TrackerContextValue = ReturnType<typeof useTrackerStore>;

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const store = useTrackerStore();
  // store identity changes every render (functions recreated); that's fine for
  // this app's size and keeps the port faithful to the original class logic.
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
