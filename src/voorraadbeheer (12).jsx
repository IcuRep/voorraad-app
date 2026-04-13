import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

// ─── HELPERS ────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).substring(2,8);
const genBusCode = () => "BUS" + Math.random().toString(36).substring(2,6).toUpperCase();
const genInviteCode = () => "INV" + Math.random().toString(36).substring(2,6).toUpperCase();

const sGet = async (k, shared) => {
  try {
    const r = shared ? await window.storage.get(k, true) : await window.storage.get(k);
    return r && r.value ? JSON.parse(r.value) : null;
  } catch { return null; }
};
const sSet = async (k, v, shared) => {
  try {
    if (!window.storage || !window.storage.set) {
      return "window.storage is niet beschikbaar";
    }

    if (shared) {
      await window.storage.set(k, JSON.stringify(v), true);
    } else {
      await window.storage.set(k, JSON.stringify(v));
    }

    return true;
  } catch (e) {
    return String(e.message || e);
  }
};

const LINKER_LADEN = {
  "Lade 1": [
    { name: "Perssok Viega Prestabo 15x15mm", code: "0556001", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/98/11855198.jpg" },
    { name: "Perssok viega Prestabo 22x22mm", code: "0556002", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/99/11855199.jpg" },
    { name: "Perssok Viega Prestabo 28x28mm", code: "0556003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/00/11855200.jpg" },
    { name: "Perssok Viega Prestabo 35x35mm", code: "0556004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/01/11855201.jpg" },
    { name: "Bochtkoppeling persaansluiting 90° PRESTABO 15x15mm", code: "0556201", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/21/11855321.jpg" },
    { name: "Bochtkoppeling persaansluiting 90° PRESTABO 22x22mm", code: "0556202", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/06/18704506.jpg" },
    { name: "Bochtkoppeling persaansluiting 90° PRESTABO 28x28mm", code: "0556203", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/23/11855323.jpg" },
    { name: "Bochtkoppeling persaansluiting 90° PRESTABO 35x35mm", code: "0556204", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/24/11855324.jpg" },
    { name: "Bochtkoppeling persaansluiting 45° PRESTABO 15x15mm", code: "0556281", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/65/11855365.jpg" },
    { name: "Bochtkoppeling persaansluiting 45° PRESTABO 22x22mm", code: "0556282", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/66/11855366.jpg" },
    { name: "Bochtkoppeling persaansluiting 45° PRESTABO 28x28mm", code: "0556283", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/67/11855367.jpg" },
    { name: "Bochtkoppeling persaansluiting 45° PRESTABO 35x35mm", code: "0556284", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/68/11855368.jpg" },
    { name: "Insteekbocht persaansluiting 45° PRESTABO 22x spie 22mm", code: "0556302", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/77/11855377.jpg" },
    { name: "Insteekbocht persaansluiting 45° PRESTABO 28x spie 28mm", code: "0556303", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/78/11855378.jpg" },
    { name: "Insteekbocht persaansluiting 45° PRESTABO 35x spie 35mm", code: "0556304", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/79/11855379.jpg" },
    { name: "T-koppeling persaansluiting PRESTABO 15x15x15mm", code: "0556364", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/09/11855409.jpg" },
    { name: "T-koppeling persaansluiting PRESTABO 22x22x22mm", code: "0556374", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/21/11855421.jpg" },
    { name: "T-koppeling persaansluiting PRESTABO 28x28x28mm", code: "0556381", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/30/11855430.jpg" },
    { name: "T-koppeling persaansluiting PRESTABO 35x35x35mm", code: "0556387", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/38/11855438.jpg" },
    { name: "T-koppeling verlopend persaansluiting PRESTABO 22x1/2 bn x22mm", code: "0556452", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/25/11855525.jpg" },
    { name: "T-koppeling verlopend persaansluiting PRESTABO 28x1/2 bn x28mm", code: "0556454", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/30/11855530.jpg" },
    { name: "T-koppeling verlopend persaansluiting PRESTABO 35x1/2 bn x35mm", code: "0556456", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/32/11855532.jpg" },
    { name: "Puntstuk persaansluiting PRESTABO 15x1/2 bt.", code: "0556023", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/12/11855212.jpg" },
    { name: "Puntstuk persaansluiting PRESTABO 22x3/4 bt.", code: "0556024", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/13/11855213.jpg" },
    { name: "Puntstuk persaansluiting PRESTABO 28x1 bt.", code: "0556025", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/14/11855214.jpg" },
    { name: "Puntstuk persaansluiting PRESTABO 35x1.1/4 bt.", code: "0556027", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/16/11855216.jpg" },
    { name: "Schroefbus recht persaansluiting PRESTABO 22x1/2 bn.", code: "0556067", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/48/11855248.jpg" },
    { name: "Schroefbus recht persaansluiting PRESTABO 28x3/4 bn.", code: "0556070", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/51/11855251.jpg" },
    { name: "Schroefbus recht persaansluiting PRESTABO 28x1 bn.", code: "0556071", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/52/11855252.jpg" },
    { name: "Schroefbus recht persaansluiting PRESTABO 35x1.1/4 bn.", code: "0556073", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/54/11855254.jpg" },
    { name: "Insteekverloopsok persaansluiting PRESTABO 15x spie 22mm", code: "0556124", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/83/11855283.jpg" },
    { name: "Insteekverloopsok persaansluiting PRESTABO 22x spie 28mm", code: "0556126", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/85/11855285.jpg" },
    { name: "Insteekverloopsok persaansluiting PRESTABO 28x spie 35mm", code: "0556129", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/88/11855288.jpg" },
  ],
  "Lade 2": [
    { name: "Insteekverloopsok persaansluiting PRESTABO 35xspie 42mm", code: "0556132", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/91/11855291.jpg" },
    { name: "Perssok Profipress koper 15x15mm Viega", code: "0565001", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/24/11858624.jpg" },
    { name: "Perssok Profipress koper 22x22mm Viega", code: "0565003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/26/11858626.jpg" },
    { name: "Perssok Profipress koper 28x28mm Viega", code: "0565004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/27/11858627.jpg" },
    { name: "Perssok Profipress koper 35x35mm Viega", code: "0565005", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/28/11858628.jpg" },
    { name: "Perssok Profipress koper 42x42mm Viega", code: "0565006", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/29/11858629.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 15x15mm Viega", code: "0565282", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/41/18703841.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 22x22mm Viega", code: "0565283", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/65/11858765.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 28x28mm Viega", code: "0565284", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/66/11858766.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 35x35mm Viega", code: "0565285", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/67/11858767.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 42x42mm Viega", code: "0565286", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/68/11858768.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 22x22mm Viega", code: "0565363", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/05/11858805.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 28x28mm Viega", code: "0565364", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/06/11858806.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 35x35mm Viega", code: "0565365", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/07/11858807.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 42x42mm Viega", code: "0565366", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/08/11858808.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS koper spie x persaansluiting 22mm Viega", code: "0565383", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/18/11858818.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS koper spie x persaansluiting 28mm Viega", code: "0565384", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/19/11858819.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS koper spie x persaansluiting 35mm Viega", code: "0565385", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/20/11858820.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS koper spie x persaansluiting 42mm Viega", code: "0565386", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/21/11858821.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS koper spie x persaansluiting 22mm Viega", code: "0565333", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/91/11858791.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS koper spie x persaansluiting 28mm Viega", code: "0565334", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/91/11858791.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS koper spie x persaansluiting 35mm Viega", code: "0565335", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/93/11858793.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS koper spie x persaansluiting 42mm Viega", code: "0565336", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/93/11858793.jpg" },
    { name: "T-koppeling Profipress koper 15x15x15mm Viega", code: "0565472", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/58/11858858.jpg" },
    { name: "T-koppeling Profipress koper 22x22x22mm Viega", code: "0565485", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/58/11858858.jpg" },
    { name: "T-koppeling Profipress koper 28x28x28mm Viega", code: "0565497", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/83/11858883.jpg" },
  ],
  "Lade 3": [
    { name: "T-koppeling Profipress koper 35x35x35mm Viega", code: "0565506", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/91/11858891.jpg" },
    { name: "T-koppeling Profipress koper 42x42x42mm Viega", code: "0565515", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/89/00/11858900.jpg" },
    { name: "Insteekverloopsok Profipress koper spie-eind 15x12mm Viega", code: "0565070", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/63/11858663.jpg" },
    { name: "Insteekverloopsok Profipress koper spie-eind 22x15mm Viega", code: "0565073", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/66/11858666.jpg" },
    { name: "Insteekverloopsok Profipress koper spie-eind 28x22mm Viega", code: "0565077", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/70/11858670.jpg" },
    { name: "Insteekverloopsok Profipress koper spie-eind 35x28mm Viega", code: "0565079", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/72/11858672.jpg" },
    { name: "Insteekverloopsok Profipress koper spie-eind 42x35mm Viega", code: "0565082", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/75/11858675.jpg" },
    { name: "Perssok verlopend Profipress koper 15x12mm Viega", code: "0565020", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/35/11858635.jpg" },
    { name: "Perssok verlopend Profipress koper 22x15mm Viega", code: "0565022", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/37/11858637.jpg" },
    { name: "Perssok verlopend Profipress koper 28x22mm Viega", code: "0565024", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/39/11858639.jpg" },
    { name: "Perssok verlopend Profipress koper 35x28mm Viega", code: "0565025", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/40/11858640.jpg" },
    { name: "Perssok verlopend Profipress koper 42x35mm Viega", code: "0565026", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/41/11858641.jpg" },
    { name: "Puntstuk Sanpress brons 15x1/2 bt. Viega", code: "0565193", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/31/11858731.jpg" },
    { name: "Puntstuk Sanpress brons 22x3/4 bt. Viega", code: "0565198", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/36/11858736.jpg" },
    { name: "Puntstuk Sanpress brons 22x1 bt. Viega", code: "0565199", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/37/11858737.jpg" },
    { name: "Puntstuk Sanpress brons 28x3/4 bt. Viega", code: "0565200", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/38/11858738.jpg" },
    { name: "Puntstuk Sanpress brons 28x1 bt. Viega", code: "0565201", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/39/11858739.jpg" },
    { name: "Puntstuk Sanpress brons 35x1 bt. Viega", code: "0565203", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/41/11858741.jpg" },
    { name: "Puntstuk Sanpress brons 35x1.1/4 bt. Viega", code: "0565204", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/42/11858742.jpg" },
    { name: "Schroefbus recht Sanpress brons 15x1/2 bn. Viega", code: "0565113", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/92/11858692.jpg" },
    { name: "Schroefbus recht Sanpress brons 22x1/2 bn. Viega", code: "0565117", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/96/11858696.jpg" },
    { name: "Schroefbus recht Sanpress brons 22x3/4 bn. Viega", code: "0565118", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/97/11858697.jpg" },
    { name: "Schroefbus recht Sanpress brons 28x3/4 bn. Viega", code: "0565121", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/00/11858700.jpg" },
    { name: "Schroefbus recht Sanpress brons 28x1 bn. Viega", code: "0565122", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/01/11858701.jpg" },
    { name: "Schroefbus recht Sanpress brons 35x1 bn. Viega", code: "0565125", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/04/11858704.jpg" },
    { name: "Schroefbus recht Sanpress brons 35x1.1/4 bn. Viega", code: "0565126", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/05/11858705.jpg" },
    { name: "T-koppeling verlopend Sanpress brons 15x1/2 bn.x15mm Viega", code: "0565571", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/89/31/11858931.jpg" },
    { name: "T-koppeling verlopend Sanpress brons 22x1/2 bn.x22mm Viega", code: "0565574", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/89/34/11858934.jpg" },
    { name: "T-koppeling verlopend Sanpress brons 28x1/2 bn.x28mm Viega", code: "0565576", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/89/36/11858936.jpg" },
    { name: "T-koppeling verlopend Sanpress brons 35x1/2 bn.x35mm Viega", code: "0565579", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/89/39/11858939.jpg" },
    { name: "Muurplaat Sanpress brons 15x1/2 bn. Viega", code: "0565621", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/89/59/11858959.jpg" },
    { name: "2-del. koppeling Sanpress brons 15x3/4 wartel Viega", code: "0565677", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/03/11859003.jpg" },
    { name: "2-del. koppeling Sanpress brons 22x3/4 wartel Viega", code: "0565682", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/08/11859008.jpg" },
    { name: "2-del. koppeling Sanpress brons 22x1 wartel Viega", code: "0565683", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/09/11859009.jpg" },
    { name: "2-del. koppeling Sanpress brons 28x1.1/4 wartel Viega", code: "0565684", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/10/11859010.jpg" },
  ],
  "Lade 4": [
    { name: "Perssok Profipress Gas koper 15x15mm Viega", code: "0566001", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/34/11859234.jpg" },
    { name: "Perssok Profipress Gas koper 22x22mm Viega", code: "0566003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/36/11859236.jpg" },
    { name: "Perssok Profipress Gas koper 28x28mm Viega", code: "0566004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/37/11859237.jpg" },
    { name: "Perssok Profipress Gas koper 35x35mm Viega", code: "0566005", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/38/11859238.jpg" },
    { name: "Perssok Profipress Gas koper 42x42mm Viega", code: "0566006", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/39/11859239.jpg" },
    { name: "Bochtkoppeling 90° Profipress Gas koper 15x15mm Viega", code: "0566121", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/98/11859298.jpg" },
    { name: "Bochtkoppeling 90° Profipress Gas koper 22x22mm Viega", code: "0566123", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/00/11859300.jpg" },
    { name: "Bochtkoppeling 90° Profipress Gas koper 28x28mm Viega", code: "0566124", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/01/11859301.jpg" },
    { name: "Bochtkoppeling 90° Profipress Gas koper 35x35mm Viega", code: "0566125", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/02/11859302.jpg" },
    { name: "Bochtkoppeling 90° Profipress Gas koper 42x42mm Viega", code: "0566126", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/03/11859303.jpg" },
    { name: "Bochtkoppeling 45° Profipress Gas koper 22x22mm Viega", code: "0566183", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/26/11859326.jpg" },
    { name: "Bochtkoppeling 45° Profipress Gas koper 28x28mm Viega", code: "0566184", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/27/11859327.jpg" },
    { name: "Bochtkoppeling 45° Profipress Gas koper 35x35mm Viega", code: "0566185", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/28/11859328.jpg" },
    { name: "Bochtkoppeling 45° Profipress Gas koper 42x42mm Viega", code: "0566186", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/29/11859329.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS Gas koper spie x persaansluiting 22mm Viega", code: "0566203", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/34/11859334.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS Gas koper spie x persaansluiting 28mm Viega", code: "0566204", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/35/11859335.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS Gas koper spie x persaansluiting 35mm Viega", code: "0566205", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/36/11859336.jpg" },
    { name: "Insteekbocht 45° PROFIPRESS Gas koper spie x persaansluiting 42mm Viega", code: "0566206", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/37/11859337.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS Gas koper spie x persaansluiting 22mm Viega", code: "0566143", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/08/11859308.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS Gas koper spie x persaansluiting 28mm Viega", code: "0566144", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/09/11859309.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS Gas koper spie x persaansluiting 35mm Viega", code: "0566145", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/10/11859310.jpg" },
    { name: "Insteekbocht 90° PROFIPRESS Gas koper spie x persaansluiting 42mm Viega", code: "0566146", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/11/11859311.jpg" },
    { name: "T-koppeling Profipress Gas koper 15X15X15mm Viega", code: "0566242", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/54/11859354.jpg" },
    { name: "T-koppeling Profipress Gas koper 22x22x22mm Viega", code: "0566248", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/60/11859360.jpg" },
    { name: "T-koppeling Profipress Gas koper 28x28x28mm Viega", code: "0566255", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/67/11859367.jpg" },
    { name: "T-koppeling Profipress Gas koper 35x35x35mm Viega", code: "0566259", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/71/11859371.jpg" },
    { name: "T-koppeling Profipress Gas koper 42x42x42mm Viega", code: "0566262", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/74/11859374.jpg" },
  ],
  "Lade 5": [
    { name: "Insteekverloopsok Profipress Gas cu spie-eind 15x12mm Viega", code: "0566040", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/48/11859248.jpg" },
    { name: "Insteekverloopsok Profipress Gas cu spie-eind 22x15mm Viega", code: "0566042", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/50/11859250.jpg" },
    { name: "Insteekverloopsok Profipress Gas cu spie-eind 28x22mm Viega", code: "0566046", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/54/11859254.jpg" },
    { name: "Insteekverloopsok Profipress Gas cu spie-eind 35x28mm Viega", code: "0566048", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/56/11859256.jpg" },
    { name: "Insteekverloopsok Profipress Gas cu spie-eind 42x35mm Viega", code: "0566051", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/59/11859259.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 15x1/2 bt. Viega", code: "0566092", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/79/11859279.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 22x3/4 bt. Viega", code: "0566097", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/84/11859284.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 22x1 bt. Viega", code: "0566098", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/85/11859285.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 28x3/4 bt. Viega", code: "0566099", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/86/11859286.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 28x1 bt. Viega", code: "0566100", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/87/11859287.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 35x1 bt. Viega", code: "0566102", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/89/11859289.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 35x1.1/4 bt. Viega", code: "0566103", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/90/11859290.jpg" },
    { name: "Puntstuk ProfiPress Gas brons 42x1.1/4 bt. Viega", code: "0566105", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/92/11859292.jpg" },
    { name: "Schroefbus recht ProfiPress Gas brons 15x1/2 bn. Viega", code: "0566062", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/64/11859264.jpg" },
    { name: "Schroefbus recht ProfiPress Gas brons 22x1/2 bn. VVE=5 Viega", code: "0566066", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/68/11859268.jpg" },
    { name: "Schroefbus recht ProfiPress Gas brons 22x3/4 bn. Viega", code: "0566067", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/69/11859269.jpg" },
    { name: "Schroefbus recht ProfiPress Gas brons 28x1 bn. Viega", code: "0566069", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/71/11859271.jpg" },
    { name: "Schroefbus recht ProfiPress Gas brons 35x1.1/4 bn. Viega", code: "0566070", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/72/11859272.jpg" },
    { name: "T-koppeling verlopend Profipress Gas brons 15x1/2 bn.x15mm Viega", code: "0566270", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/81/11859381.jpg" },
    { name: "T-koppeling verlopend Profipress Gas brons 22x1/2 bn.x22mm Viega", code: "0566272", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/83/11859383.jpg" },
    { name: "T-koppeling verlopend Profipress Gas brons 28x3/4 bn.x28mm VVE=5 Viega", code: "0566275", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/86/11859386.jpg" },
    { name: "Knelring Super Blue 22mm kunststof tbv 3/8 dikwandige buis VSH", code: "0558395", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/45/26256345.jpg" },
    { name: "Knelring Super Blue 22mm kunststof tbv 1/2 dikwandige buis VSH", code: "0557820", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/45/26256345.jpg" },
    { name: "Knelring Super Blue 28mm kunststof tbv 3/4 dikwandige buis VSH", code: "0557822", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/45/26256345.jpg" },
    { name: "Knelring Super Blue 35mm kunststof tbv 1 dikwandige buis VSH", code: "0557824", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/45/26256345.jpg" },
    { name: "Vul/aftapkraan vernikkeld +tule +kap 1/2 bt. simplex Flamco", code: "4027833", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/77/25/45487725.jpg" },
    { name: "Vul/aftapkraan zwaar model brons DN15 1/2 bu.dr. DIN 3848 Oventrop", code: "4519756", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/25/02/53552502.jpg" },
    { name: "Vul/aftapkraan zwaar model brons DN20 3/4 bu.dr. DIN 3848 Oventrop", code: "4519757", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/25/02/53552502.jpg" },
    { name: "Perssok 15PK 16x16mm kunststof Henco", code: "9234314", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/28/98/46812898.jpg" },
    { name: "Perssok 15PK 20x20mm kunststof Henco", code: "9234315", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/28/98/46812898.jpg" },
    { name: "Kniekoppeling persaansluiting 90° 1PK 16x16mm kunststof Henco", code: "9234407", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/29/36/46812936.jpg" },
    { name: "Kniekoppeling persaansluiting 90° 1PK 20x20mm kunststof Henco", code: "9234408", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/29/36/46812936.jpg" },
    { name: "T-koppeling persaansluiting 9PK 16x16x16mm kunststof Henco", code: "9234555", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/42/46813042.jpg" },
    { name: "T-koppeling persaansluiting 9PK 20x20x20mm kunststof Henco", code: "9234556", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/42/46813042.jpg" },
  ],
  "Lade 6": [
    { name: "Aftapper messing draaibaar blauw 1/4 bt. Raminex", code: "0534595", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/78/63/11847863.jpg" },
    { name: "Aftapper messing draaibaar rood 1/4 bt. Raminex", code: "0534594", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/03/89/27050389.jpg" },
    { name: "Ontluchtingssleutel metaal", code: "0FK5976", qty: 20, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/36/74/35893674.jpg" },
    { name: "Verloopset 15mm - 14x2,0mm PenTec", code: "0540761", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/29/105769029.jpg" },
    { name: "Knelringset vernikkeld 15mm - 16x2,0mm PenTec", code: "0545995", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/39/105769039.jpg" },
    { name: "Knelringset vernikkeld 22mm - 20x2,0mm PenTec", code: "0545969", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/42/105769042.jpg" },
    { name: "Knelringset vernikkeld M22 - 16x2,0mm PenTec", code: "0545968", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/28/105769028.jpg" },
    { name: "Kraanverlengstuk verchroomd 1/2x10mm", code: "0730153", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchroomd 1/2x20mm", code: "0730155", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchroomd 1/2x30mm", code: "0730157", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchroomd 1/2x40mm", code: "0730158", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchroomd 1/2x50mm", code: "0730159", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Wasmachinekraan 1/2bt. knop zwart m. keerklep", code: "0720588", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/02/11863802.jpg" },
    { name: "Veiligheidsventiel Prescor 1/2bt.xbn. 3bar Flamco", code: "0534027", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/75/21/11847521.jpg" },
    { name: "Veiligheidsventiel Prescor 3/4bn. 3bar 165kW Flamco", code: "0534030", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/96/08/120439608.jpg" },
    { name: "Veiligheidsventiel boiler Prescor B 1/2bn. 8bar Flamco", code: "0254005", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/95/23/120439523.jpg" },
    { name: "Veiligheidsventiel boiler Prescor B 3/4x1bn. 8bar Flamco", code: "0254006", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/95/27/120439527.jpg" },
    { name: "Gaskogelkraan messing knel 15 koppeling knel 15mm g VSH", code: "0730036", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/38/133323038.jpg" },
    { name: "Gaskogelkraan messing 15x1/2 koppeling bt. g VSH", code: "0730055", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/43/133323043.jpg" },
    { name: "Gaskogelkraan messing 22x3/4 koppeling bt. g VSH", code: "0730057", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/43/133323043.jpg" },
    { name: "Vacuumklep N36 15 1/2 Watts", code: "0FP2049", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/01/16/132510116.jpg" },
    { name: "Automatische ontluchter Minical 3/8 Caleffi", code: "0533800", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/28/12/133772812.jpg" },
    { name: "Automatische ontluchter Flexvent 1/2bt. 10bar Flamco", code: "0534009", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/77/63/120437763.jpg" },
    { name: "Thermometer alu. 63mm 0°-120°C 1/2bt. x40mm axiaal", code: "0522415", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/96/11839096.jpg" },
    { name: "Staafthermometer haaks 150x36mm W3211 alu. 0°-120°C insteekl. 63mm 1/2bt", code: "0522420", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/98/11839098.jpg" },
    { name: "Manometer 63mm 1/4 axiaal 0-4bar Flamco", code: "0522000", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/07/25655507.jpg" },
    { name: "Manometer 0-4bar 63mm 1/4 radiaal Flamco", code: "0AP3209", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/06/38/11880638.jpg" },
    { name: "Manometer 0-4bar 63mm 1/4 radiaal Flamco", code: "0564057", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/06/38/11880638.jpg" },
    { name: "Kogelkraan Ballofix chroom knel 15mm", code: "0534544", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/56/133334956.jpg" },
    { name: "Minikogelkraan Ballofix schroevendraaierbediening FM G1/2", code: "0534531", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/65/133334965.jpg" },
    { name: "Stekkerplug tbv Alpha pomp compleet GRUNDFOS", code: "0502223", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/31/60/46823160.jpg" },
    { name: "Slangklem 12-22mm", code: "0508266", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/69/11833869.jpg" },
    { name: "Slangklem 16-27mm", code: "0508269", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/72/11833872.jpg" },
    { name: "Automatische ontluchter Spirotop 1/2bn. Spirotech", code: "0535098", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/82/28/11848228.jpg" },
    { name: "Terugslagklep CIM30 vernikkeld hor/vert. 1bn. Cimberio", code: "0534600", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/78/67/11847867.jpg" },
    { name: "Inlaatcombinatie Q-lite BIC 15x15mm knel 8bar VSH", code: "0254021", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/24/44/11802444.jpg" },
    { name: "Inlaatcombinatie DUCO UBIC 22mm knel 8bar PenTec", code: "0254009", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/01/116206301.jpg" },
    { name: "Schroefdraadafdichting Kolmat Fibre Seal 14mm rol a 15m. Griffon", code: "0585066", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/04/88/11860488.jpg" },
    { name: "Kroon kopervet Copper Plus tube 100gram (8503698 (Wasco))", code: "", qty: 2, img: "https://imagescdn.wasco.nl/5/001/825/349/8503698_Z9953159_Kroon_Hoofdafbeelding_01.jpg" },
    { name: "Soldeerkwastje kunststof haar Griffon", code: "0586005", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/13/29741313.jpg" },
  ],
  "Lade 7": { _info: "🔩 Allerlei boren" },
  "Lade 8": [
    { name: "Klemset 1/2 x 15mm HERZ", code: "0530160", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/11846428.jpg" },
    { name: "Klemset staal/CU 1/2 x 15mm Danfoss", code: "0530402", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/60/56805860.jpg" },
    { name: "Klemset 1/2 x 15mm messing vernikkeld IMI Heimeier", code: "0531121", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/97/64/50039764.jpg" },
    { name: "Radiatorafsluiter handbediend AS-T-90 recht 3/8 HERZ", code: "0530001", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/21/20/18632120.jpg" },
    { name: "Radiatorafsluiter handbediend AS-T-90 haaks 3/8 HERZ", code: "0530006", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/21/30/18632130.jpg" },
    { name: "Radiatorafsluiter handbediend AS-T-90 recht 1/2 HERZ", code: "0530002", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/26/11846326.jpg" },
    { name: "Radiatorafsluiter handbediend AS-T-90 haaks 1/2 HERZ", code: "0530007", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/34/11846334.jpg" },
    { name: "Radiatorafsluiter handbediend AS-T-90 recht 3/4 HERZ", code: "0530003", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/28/11846328.jpg" },
    { name: "Radiatorafsluiter handbediend AS-T-90 haaks 3/4 HERZ", code: "0530008", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/36/11846336.jpg" },
    { name: "Radiatorafsluiter thermostatisch TS-98-V recht 1/2 HERZ", code: "0529991", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/16/11846316.jpg" },
    { name: "Radiatorafsluiter thermostatisch TS-98-V haaks 1/2 HERZ", code: "0529993", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/21/76/18632176.jpg" },
    { name: "Radiatorafsluiter thermostatisch TS-98-V recht 1/2 HERZ", code: "0529991", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/16/11846316.jpg" },
    { name: "Radiatorbocht 1/2 conisch chroom HERZ", code: "0530046", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/74/11846374.jpg" },
    { name: "RA aansluitbocht 90° 1/2 Danfoss", code: "0530436", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/99/123039399.jpg" },
    { name: "Bocht brons vernikkeld voor Duolux DN15 IMI Heimeier", code: "0531301", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/68/49/11846849.jpg" },
    { name: "Staartstuk 1/2x76 verlengd HERZ", code: "0530052", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/18/48/18631848.jpg" },
    { name: "Voetventiel / retourafsluiter RL-1 recht 1/2 HERZ", code: "0532084", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/15/12/18631512.jpg" },
    { name: "Voetventiel / retourafsluiter RL-1 haaks 1/2 HERZ", code: "0532088", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/15/18/18631518.jpg" },
    { name: "hermostaatkop zonder 0-stand wit", code: "0530080", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/90/11846390.jpg" },
    { name: "Thermostaatknop AVEO-RA ingebouwde voeler", code: "0GJ1475", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/52/56805552.jpg" },
    { name: "Thermostaatkop K wit met 0-stand IMI Heimeier", code: "0531424", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/01/67/50040167.jpg" },
    { name: "Handbedieningsknop Design tbv thermostatische afsluiters HERZ", code: "0530076", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/88/11846388.jpg" },
    { name: "Perssok MaxiPro 1/4 x 1/4 2x persaansluiting Banninger", code: "0EX9228", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/56/11902756.jpg" },
    { name: "Perssok MaxiPro 3/8x3/8 2x persaansluiting Banninger", code: "0EX9229", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/57/11902757.jpg" },
    { name: "Perssok MaxiPro 1/2x1/2 2x persaansluiting Banninger", code: "0EX9230", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/02/11779202.jpg" },
    { name: "Perssok MaxiPro 5/8x5/8 2x persaansluiting Banninger", code: "0EX9231", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/58/11902758.jpg" },
    { name: "Bochtkoppeling MAXIPRO 90° 1/4 2x persaansluiting VVE=5 Banninger", code: "0EX9184", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/17/11902717.jpg" },
    { name: "Bochtkoppeling MAXIPRO 90° 3/8 2x persaansluiting Banninger", code: "0EX9185", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/18/11902718.jpg" },
    { name: "Bochtkoppeling MAXIPRO 90° 1/2 2x persaansluiting Banninger", code: "0EX9186", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/19/11902719.jpg" },
    { name: "Bochtkoppeling MAXIPRO 90° 5/8 2x persaansluiting Banninger", code: "0EX9187", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/91/98/11779198.jpg" },
    { name: "Flare koppeling MAXIPRO 1/4 messing wartel 1/4 1x pers Banninger", code: "0EX9252", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/05/11779205.jpg" },
    { name: "Flare koppeling MAXIPRO 3/8 messing wartel 3/8 1x pers Banninger", code: "0EX9253", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/71/11902771.jpg" },
    { name: "Flare koppeling MAXIPRO 1/2 messing wartel 1/2 1x pers Banninger", code: "0EX9254", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/71/11902771.jpg" },
    { name: "Flare koppeling MAXIPRO 5/8 messing wartel 5/8 1x pers Banninger", code: "0EX9255", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/72/11902772.jpg" },
    { name: "GARD WATERSTOP 13MM-15MM (4330790 (TUI))", code: "", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4330790.gif" },
    { name: "GARD KRAANSTUK 21MM (G 1/2) (4445046 (TUI))", code: "", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4445046.gif" },
    { name: "GARD KRAANSTUK 26,5MM (G 3/4) (4445053 (TUI))", code: "", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4445053.gif" },
    { name: "GARD KRAANSTUK 33,3MM (G 1) (4445074 (TUI))", code: "", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4445074.gif" },
  ],
  "Lade 9": [
    { name: "Zeskantbout met moer DIN601/555 M16x120mm", code: "4860628", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout met moer DIN601/555 M16x110mm", code: "4860627", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout met moer DIN601/555 M16x90mm", code: "4860625", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout + moer verzinkt M16x60", code: "0503050", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout met moer DIN601/555 M12x80mm", code: "0536430", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout met moer DIN601/555 M12x60mm", code: "4860592", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Bevestigingsplaat / grondplaat GP8 80x30mm", code: "0560906", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/36/16/12063616.jpg" },
    { name: "Bevestigingsplaat / grondplaat GP1/2 80x30mm", code: "0560907", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/22/11857322.jpg" },
    { name: "Kogelscharnier KS M8x8 bt.xbn", code: "0560517", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/33/74/12063374.jpg" },
    { name: "Kogelscharnier Clickeasy K M8x8 FastFix", code: "0563442", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/79/80/11857980.jpg" },
    { name: "Schuifmoer verzinkt Rapidrail WM0-35 M8 + veerring Walraven", code: "0561430", qty: 20, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/71/69/90107169.jpg" },
    { name: "Schuifmoer Clickeasy M8 FastFix", code: "0563424", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/39/05/12063905.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK koper Ø15mm", code: "0FT2558", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK koper Ø22mm", code: "0FT2560", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK koper Ø28mm", code: "0FT2561", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK koper Ø35mm", code: "0FT2562", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Muurbeugel BM M8x15mm", code: "0561073", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/97/11857397.jpg" },
    { name: "Muurbeugel BM M8x1/2-22 HK", code: "0561003", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/91/11857391.jpg" },
    { name: "Muurbeugel BM M8x28mm", code: "0561075", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/98/11857398.jpg" },
    { name: "Muurbeugel BM M8x35mm", code: "0561076", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/99/11857399.jpg" },
    { name: "Profielklem KCK M8 verzinkt FastFix", code: "0563262", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/36/69/12063669.jpg" },
    { name: "Kopflens KF-H tbv Rail R1/2/3/4/6 FastFix", code: "0560967", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/37/10/12063710.jpg" },
    { name: "Railverbinder ClickConnection 90° 60x35x5mm FastFix", code: "0563472", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/94/80/130519480.jpg" },
  ],
  "Lade 10": { _info: "🔧 Gereedschappen & producten" },
  "Lade 11": { _info: "🔵 PVC fittingen & pijpbeugels" },
  "Lade 12": { _info: "🪝 Hijsmiddelen" },
};

const RECHTER_LADEN = {
  "Lade 1": [
    { name: "Knelring messing 12mm", code: "0557831", qty: 1, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Knelring messing 15mm", code: "0557832", qty: 1, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Knelring messing 22mm", code: "0557833", qty: 1, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Knelring messing 28mm", code: "0557834", qty: 1, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Ontluchter vernikkeld 1/2”", code: "0533234", qty: 1, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/93/11847393.jpg" },
    { name: "Aftapper draaibaar 3/8” vernikkeld", code: "0533031", qty: 1, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/72/39/11847239.jpg" },
    { name: "Aftapper draaibaar 1/2” vernikkeld", code: "0533030", qty: 1, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/72/39/11847239.jpg" },
    { name: "Afsluitplaat messing verzinkt ontluchter 15mm", code: "0558430", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/90/26257090.jpg" },
    { name: "Afsluitplaat messing verzinkt ontluchter 22mm", code: "0558432", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/90/26257090.jpg" },
    { name: "Knelsok 15x15mm vernikkeld", code: "0546004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/54/26256354.jpg" },
    { name: "Kniekoppeling knel 15x15mm vernikkeld", code: "0546116", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/67/26256367.jpg" },
    { name: "Insteekknie knel 15mm vernikkeld", code: "0547122", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/92/11852792.jpg" },
    { name: "Puntstuk knel 15x1/2 bt vernikkeld", code: "0546050", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/59/26256359.jpg" },
    { name: "Puntstuk haaks 15x1/2 vernikkeld", code: "0546155", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/64/26256364.jpg" },
    { name: "Schroefbus recht knel 15x1/2 bn vernikkeld", code: "0546075", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/05/26256405.jpg" },
    { name: "Schroefbus haaks 15x1/2 vernikkeld", code: "0546175", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/06/26256406.jpg" },
    { name: "Puntstuk knel 15x3/4 bt vernikkeld", code: "0546029", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/59/26256359.jpg" },
    { name: "Schroefbus haaks 15x3/4 bn vernikkeld", code: "0546177", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/06/26256406.jpg" },
    { name: "T-koppeling vernikkeld knel 15x15x15mm", code: "0546213", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/07/26256407.jpg" },
    { name: "T-koppeling verlopend knel 15x1/2x15 bn vernikkeld", code: "0547090", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/63/11852763.jpg" },
    { name: "T-koppeling verlopend knel 15x15x1/2 bn vernikkeld", code: "0547094", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/67/11852767.jpg" },
    { name: "Hoek T-koppeling verlopend knel 15x15x15mm vernikkeld", code: "0546415", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/76/11852776.jpg" },
    { name: "Knelsok verlopend 22x15mm", code: "0546019", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/01/26256401.jpg" },
    { name: "Verloopknie knel 22x15mm vernikkeld", code: "0546125", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/72/26256372.jpg" },
    { name: "Knelsok 22x22mm vernikkeld", code: "0546006", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/54/26256354.jpg" },
    { name: "Kniekoppeling knel 22x22mm vernikkeld", code: "0546118", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/67/26256367.jpg" },
    { name: "Insteekknie knel 22mm vernikkeld", code: "0547123", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/93/11852793.jpg" },
    { name: "Knelsok verlopend 28x22mm", code: "0546024", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/01/26256401.jpg" },
    { name: "Puntstuk knel 22x3/4 con.bt vernikkeld", code: "0546052", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/59/26256359.jpg" },
    { name: "Puntstuk knel 22x1 con.bt vernikkeld", code: "0546054", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/59/26256359.jpg" },
    { name: "Puntstuk haaks 22x3/4 con.bt vernikkeld", code: "0546158", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/64/26256364.jpg" },
    { name: "Schroefbus recht knel 22x3/4 bn vernikkeld", code: "0546081", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/05/26256405.jpg" },
    { name: "Schroefbus haaks knel 22x3/4 bn vernikkeld", code: "0546183", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/06/26256406.jpg" },
    { name: "T-koppeling vernikkeld knel 22x15x15mm", code: "0546258", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/16/26256416.jpg" },
    { name: "T-koppeling vernikkeld knel 15x22x15mm", code: "0546241", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/75/26256375.jpg" },
  ],
  "Lade 2": [
    { name: "T-koppeling vernikkeld knel 22x15x22mm", code: "0546260", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/75/26256375.jpg" },
    { name: "T-koppeling vernikkeld knel 22x22x22mm", code: "0546215", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/07/26256407.jpg" },
    { name: "T-koppeling verlopend knel 22x1/2x22 bn vernikkeld", code: "0546324", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/64/11852764.jpg" },
    { name: "T-koppeling verlopend knel 22x22x1/2 bn vernikkeld", code: "0547095", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/23/57/27742357.jpg" },
    { name: "T-koppeling vernikkeld knel 22x22x15mm", code: "0546264", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/17/26256417.jpg" },
    { name: "Hoek-T-koppeling verlopend knel 22x15x15mm vernikkeld", code: "0546421", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/23/26256423.jpg" },
    { name: "Hoek T-koppeling verlopend knel 22x15x22mm vernikkeld", code: "0547106", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/74/11852774.jpg" },
    { name: "Hoek-T-koppeling verlopend knel 22x22x22mm vernikkeld", code: "0546417", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/22/26256422.jpg" },
    { name: "Eindkoppeling knel 12mm", code: "0557061", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Eindkoppeling knel 15mm", code: "0557062", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Eindkoppeling knel 22mm", code: "0557063", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Eindkoppeling knel 28mm", code: "0557064", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Verloopset / verloopknelring 18x15mm", code: "0DY3448", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/30/26256430.jpg" },
    { name: "Verloopset / verloopknelring 22x15mm", code: "0557868", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/30/26256430.jpg" },
    { name: "Verloopset / verloopknelring 28x22mm", code: "0557871", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/30/26256430.jpg" },
    { name: "Verloopset / verloopknelring 35x28mm", code: "0557872", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/30/26256430.jpg" },
    { name: "Afsluitplaatje knel 15mm", code: "0557712", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/83/26256383.jpg" },
    { name: "Afsluitplaatje knel 22mm", code: "0557713", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/83/26256383.jpg" },
    { name: "Afsluitplaatje knel 28mm", code: "0557714", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/83/26256383.jpg" },
    { name: "Verloopring messing 1/2x1/8", code: "0730223", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/87/18707087.jpg" },
    { name: "Verloopring messing 1/2x1/4", code: "0702225", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/94/25671394.jpg" },
    { name: "Verloopring messing 1/2x3/8", code: "0702226", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/94/25671394.jpg" },
    { name: "Verloopring messing 3/4x1/2", code: "0702230", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/14/28/25671428.jpg" },
    { name: "Verloopring messing 1x3/4", code: "0702235", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/30/18707030.jpg" },
    { name: "Verloopring messing 11/4x1", code: "0702239", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/30/18707030.jpg" },
    { name: "Steunhuls koper 15x1,0mm", code: "0557891", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/36/26256436.jpg" },
    { name: "Steunhuls koper 22x1,0mm", code: "0557893", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/36/26256436.jpg" },
    { name: "Plug messing 1/2 bt", code: "0702083", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/14/20/25671420.jpg" },
    { name: "Plug messing 3/4 bt", code: "0702084", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/92/25671392.jpg" },
    { name: "Plug messing zeskant 1 bt", code: "0702085", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/57/18707057.jpg" },
    { name: "Kap messing 1/2 bn", code: "0730134", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/50/18707050.jpg" },
    { name: "Kap messing 3/4 bn", code: "0730135", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/51/18707051.jpg" },
    { name: "Kap messing 1 bn", code: "0702066", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/29/90/11862990.jpg" },
    { name: "Dubbele nippel messing 1/2 bt", code: "0530177", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/14/00/25671400.jpg" },
    { name: "Dubbele nippel messing 3/4 bt", code: "0530178", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/88/25671388.jpg" },
    { name: "Dubbele nippel messing 1 bt", code: "0702165", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/29/11863029.jpg" },
    { name: "Knelsok 15x15mm", code: "0557002", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/19/26235119.jpg" },
    { name: "Kniekoppeling knel 15x15mm", code: "0557102", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/65/11855765.jpg" },
    { name: "Knelsok verlopend 15x12mm", code: "0557011", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/52/26256352.jpg" },
    { name: "Puntstuk Super knel 15x1/2 con.bt", code: "0557023", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/26/26235126.jpg" },
    { name: "Puntstuk knel 15x3/4 con.bt", code: "0557024", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/26/26235126.jpg" },
  ],
  "Lade 3": [
    { name: "Puntknie knel 15x1/2 con.bt", code: "0557123", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/80/11855780.jpg" },
    { name: "Puntknie knel 15x3/4 bt", code: "0557124", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/81/11855781.jpg" },
    { name: "Schroefbus recht knel 15x1/2 bn", code: "0557052", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/30/26235130.jpg" },
    { name: "Schroefbus recht knel 15x3/4 bn", code: "0557044", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/30/26235130.jpg" },
    { name: "Schroefbus haaks knel 15x1/2 bn", code: "0557152", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/03/11855803.jpg" },
    { name: "Schroefbus haaks knel 15x3/4 bn", code: "0557144", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/95/11855795.jpg" },
    { name: "Muurplaat knel 15x1/2 bn", code: "0557403", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/68/11855868.jpg" },
    { name: "T-koppeling knel 15x15x15mm", code: "0557202", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/15/11855815.jpg" },
    { name: "T-koppeling verlopend knel 15x1/2x15mm", code: "0557235", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/41/11855841.jpg" },
    { name: "Knelsok verlopend 22x15mm", code: "0557013", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/52/26256352.jpg" },
    { name: "Verloopknie knel 22x15mm", code: "0557113", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/72/11855772.jpg" },
    { name: "Knelsok verlopend 22x18mm", code: "0557014", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/52/26256352.jpg" },
    { name: "Knelsok verlopend 28x22mm", code: "0557016", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/52/26256352.jpg" },
    { name: "Knelsok 22x22mm", code: "0557003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/19/26235119.jpg" },
    { name: "Kniekoppeling knel 22x22mm", code: "0557103", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/66/11855766.jpg" },
    { name: "Puntstuk Super knel 22x1/2 bt", code: "0557025", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/26/26235126.jpg" },
    { name: "Puntstuk knel 22x3/4 con.bt", code: "0557026", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/26/26235126.jpg" },
    { name: "Puntknie knel 22x1/2 bt", code: "0557125", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/82/11855782.jpg" },
    { name: "Puntknie knel 22x3/4 con.bt", code: "0557126", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/83/11855783.jpg" },
    { name: "Schroefbus recht knel 22x3/4 bn", code: "0557056", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/30/26235130.jpg" },
    { name: "Schroefbus haaks knel 22x3/4 bn", code: "0557153", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/04/11855804.jpg" },
    { name: "Muurplaat knel 22x3/4 bn", code: "0557406", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/69/11855869.jpg" },
    { name: "T-koppeling knel 22x22x22mm", code: "0557203", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/31/26959031.jpg" },
    { name: "T-koppeling verlopend knel 22x1/2x22mm", code: "0557237", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/43/11855843.jpg" },
    { name: "Verloopknie knel 28x22mm", code: "0557115", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/74/11855774.jpg" },
    { name: "Knelsok 28x28mm", code: "0557004", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/19/26235119.jpg" },
    { name: "Kniekoppeling knel 28x28mm", code: "0557104", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/67/11855767.jpg" },
  ],
  "Lade 4": [
    { name: "Sok malleabel zwart 3/8 bn", code: "0551102", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/24/60/11372460.jpg" },
    { name: "Sok malleabel zwart 1/2 bn", code: "0551103", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/76/11854476.jpg" },
    { name: "Sok malleabel zwart 3/4 bn", code: "0551104", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/77/11854477.jpg" },
    { name: "Sok malleabel zwart 1 bn", code: "0551105", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/78/11854478.jpg" },
    { name: "Sok malleabel zwart 1.1/4 bn", code: "0551106", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/79/11854479.jpg" },
    { name: "Sok malleabel zwart 1.1/2 bn", code: "0551107", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/80/11854480.jpg" },
    { name: "Knie malleabel zwart 3/8 bn", code: "0550102", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/25/11854225.jpg" },
    { name: "Knie malleabel zwart 1/2 bn", code: "0550103", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/26/11854226.jpg" },
    { name: "Knie malleabel zwart 3/4 bn", code: "0550104", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/27/11854227.jpg" },
    { name: "Knie malleabel zwart 1 bn", code: "0550105", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/28/11854228.jpg" },
    { name: "Knie malleabel zwart 1.1/4 bn", code: "0550106", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/29/11854229.jpg" },
    { name: "Dubbele nippel malleabel zwart 3/8 bt", code: "0551152", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/92/11854492.jpg" },
    { name: "Dubbele nippel malleabel zwart 1/2 bt", code: "0551153", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/93/11854493.jpg" },
    { name: "Dubbele nippel malleabel zwart 3/4 bt", code: "0551154", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/94/11854494.jpg" },
    { name: "Dubbele nippel malleabel zwart 1 bt", code: "0551155", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/95/11854495.jpg" },
    { name: "Dubbele nippel malleabel zwart 1.1/4 bt", code: "0551156", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/96/11854496.jpg" },
    { name: "Stop met rand malleabel zwart 3/8 bt", code: "0551182", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/03/11854503.jpg" },
    { name: "Stop met rand malleabel zwart 1/2 bt", code: "0551183", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/04/11854504.jpg" },
    { name: "Stop met rand malleabel zwart 3/4 bt", code: "0551184", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/05/11854505.jpg" },
    { name: "Stop met rand malleabel zwart 1 bt", code: "0551185", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/06/11854506.jpg" },
    { name: "Stop met rand malleabel zwart 1.1/4 bt", code: "0551186", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/07/11854507.jpg" },
    { name: "Kap malleabel rond zwart 3/8 bn", code: "0551249", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/14/11854514.jpg" },
    { name: "Kap malleabel rond zwart 1/2 bn", code: "0551250", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/15/11854515.jpg" },
    { name: "Kap malleabel rond zwart 3/4 bn", code: "0551251", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/16/11854516.jpg" },
    { name: "Kap malleabel rond zwart 1 bn", code: "0551252", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/17/11854517.jpg" },
    { name: "Kap malleabel rond zwart 1.1/4 bn", code: "0551253", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/18/11854518.jpg" },
    { name: "Verloopsok malleabel zwart 1/2x3/8 bn", code: "0550806", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/43/80/11854380.jpg" },
    { name: "Verloopsok malleabel zwart 3/4x1/2 bn", code: "0550810", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/43/82/11854382.jpg" },
    { name: "Verloopsok malleabel zwart 1x3/4 bn", code: "0550815", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/43/85/11854385.jpg" },
    { name: "Verloopsok malleabel zwart 1.1/4 x1 bn", code: "0550821", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/43/88/11854388.jpg" },
    { name: "Knie malleabel zwart 3/8 bn.xbt", code: "0550172", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/48/11854248.jpg" },
    { name: "Knie malleabel zwart 1/2 bn.xbt", code: "0550173", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/49/11854249.jpg" },
    { name: "Knie malleabel zwart 3/4 bn.xbt", code: "0550174", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/50/11854250.jpg" },
  ],
  "Lade 5": [
    { name: "Knie malleabel zwart 1 bn.xbt", code: "0550175", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/51/11854251.jpg" },
    { name: "Knie malleabel zwart 1.1/4 bn.xbt", code: "0550176", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/52/11854252.jpg" },
    { name: "T-koppeling malleabel zwart 1/2 bn", code: "0550303", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/82/11854282.jpg" },
    { name: "T-koppeling malleabel zwart 3/4 bn", code: "0550304", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/83/11854283.jpg" },
    { name: "T-koppeling malleabel zwart 1 bn", code: "0550305", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/84/11854284.jpg" },
    { name: "T-koppeling malleabel zwart 1.1/4 bn", code: "0550306", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/85/11854285.jpg" },
    { name: "Verloopring malleabel zwart 1/2x1/4 bt.xbn", code: "0550865", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/08/11854408.jpg" },
    { name: "Verloopring malleabel zwart 3/4x1/2 bt.xbn", code: "0550870", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/12/11854412.jpg" },
    { name: "Verloopring malleabel zwart 1x1/2 bt.xbn", code: "0550874", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/15/11854415.jpg" },
    { name: "Verloopring malleabel zwart 1x3/4 bt.xbn", code: "0550875", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/16/11854416.jpg" },
    { name: "Verloopring malleabel zwart 1.1/4x1/2 bt.xbn", code: "0550879", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/17/11854417.jpg" },
    { name: "Verloopring malleabel zwart 1.1/4x3/4 bt.xbn", code: "0550880", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/18/11854418.jpg" },
    { name: "Verloopring malleabel zwart 1.1/4x1 bt.xbn", code: "0550881", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/19/11854419.jpg" },
    { name: "Soknippel malleabel zwart 1/2x3/8 bn.xbt", code: "0550986", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/61/11854461.jpg" },
    { name: "Soknippel malleabel zwart 3/4x1/2 bn.xbt", code: "0550990", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/63/11854463.jpg" },
    { name: "Soknippel malleabel zwart 1x1/2 bn.xbt", code: "0550994", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/64/11854464.jpg" },
    { name: "Soknippel malleabel zwart 1x3/4 bn.xbt", code: "0550995", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/65/11854465.jpg" },
    { name: "Soknippel malleabel zwart 1.1/4x1 bn.xbt", code: "0551001", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/68/11854468.jpg" },
    { name: "Verloopnippel malleabel zwart 1/2x1/4 bt", code: "0550925", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/41/11854441.jpg" },
    { name: "Verloopnippel malleabel zwart 3/4x1/2 bt", code: "0550930", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/44/11854444.jpg" },
    { name: "Verloopnippel malleabel zwart 1x1/2 bt", code: "0550934", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/45/11854445.jpg" },
    { name: "Verloopnippel malleabel zwart 1x3/4 bt", code: "0550935", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/46/11854446.jpg" },
    { name: "3-del. koppeling malleabel con. zwart 1/2 bn", code: "0551303", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/40/11854540.jpg" },
    { name: "3-del. koppeling malleabel con. zwart 3/4 bn", code: "0551304", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/41/11854541.jpg" },
    { name: "3-del. koppeling malleabel con. zwart 1 bn", code: "0551305", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/42/11854542.jpg" },
    { name: "3-del. koppeling mallea. con. zwart 1.1/4 bn", code: "0551306", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/43/11854543.jpg" },
  ],
  "Lade 6": [
    { name: "3-del. koppeling malleable zwart 1/2 bn.xbt. conisch", code: "0551323", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/49/11854549.jpg" },
    { name: "3-del. koppeling malleable zwart 3/4 bn.xbt. conisch", code: "0551324", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/50/11854550.jpg" },
    { name: "3-del. koppeling mallea. con. zwart 1 bn.xbt", code: "0551325", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/51/11854551.jpg" },
    { name: "3-del. koppeling malleable zwart 1.1/4 bn.xbt. conisch", code: "0551326", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/52/11854552.jpg" },
    { name: "Lassok zwart 1/8 bn", code: "0190808", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/84/11800784.jpg" },
    { name: "Lassok zwart 1/4 bn", code: "0190807", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/83/11800783.jpg" },
    { name: "Lassok zwart 3/8 bn", code: "0190811", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/85/11800785.jpg" },
    { name: "Lassok zwart 1/2 bn", code: "0190806", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/82/11800782.jpg" },
    { name: "Lassok zwart 3/4 bn", code: "0190810", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/85/11800785.jpg" },
    { name: "Lassok zwart 1 bn", code: "0190803", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/85/11800785.jpg" },
    { name: "Lassok zwart 1.1/4 bn", code: "0190805", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/81/11800781.jpg" },
    { name: "Lasbocht naadl 90° (1/2)", code: "0559002", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/12/11856212.jpg" },
    { name: "Lasbocht naadl 90° (3/4)", code: "0559004", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/18/11856218.jpg" },
    { name: "Lasbocht naadl 90° (1)", code: "0559007", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/24/11856224.jpg" },
    { name: "Lasbocht naadl 90° (1.1/4)", code: "0559009", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/30/11856230.jpg" },
    { name: "Lasbocht naadl 90° (1.1/2)", code: "0559011", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/36/11856236.jpg" },
    { name: "Lasbocht naadl 90° (2)", code: "0559015", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/50/11856250.jpg" },
    { name: "Pijpnippel zwart 1/2 bt. x 60mm", code: "0190839", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart 3/4 bt. x 60mm", code: "0190853", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart 3/4 bt. x 120mm", code: "0190848", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart 1 bt. x 60mm", code: "0190817", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart 1 bt. x 120mm", code: "0190813", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart 11/4 bt. x 80mm", code: "0190832", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/91/11800791.jpg" },
    { name: "Pijpnippel zwart 11/2 bt. x 120mm", code: "0190820", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart 2 bt. x 100mm", code: "0190841", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/75/24/12607524.jpg" },
  ],
  "Lade 7": { _info: "🔨 Beugijzers" },
};


// ─── STYLES ─────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
:root { --bg:#0c1117; --surface:#161d27; --surface2:#1c2533; --accent:#f97316; --accent2:#3b82f6; --text:#e8ecf1; --text2:#8896a8; --border:#2a3545; --success:#22c55e; --danger:#ef4444; --radius:14px; }
body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; overflow-x:hidden; }
.app { min-height:100vh; width:100%; padding-bottom:100px; }
.auth-wrap { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; }
.auth-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:32px 24px; width:100%; max-width:400px; }
.auth-logo { font-family:'Space Mono',monospace; font-size:12px; letter-spacing:3px; color:var(--accent); text-transform:uppercase; text-align:center; margin-bottom:4px; }
.auth-title { font-size:22px; font-weight:700; text-align:center; margin-bottom:24px; }
.auth-input { width:100%; padding:14px 16px; border-radius:12px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-size:15px; font-family:'DM Sans',sans-serif; margin-bottom:12px; outline:none; }
.auth-input:focus { border-color:var(--accent); }
.auth-input::placeholder { color:var(--text2); }
.auth-btn { width:100%; padding:14px; border-radius:12px; border:none; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:transform .15s; margin-bottom:8px; }
.auth-btn:active { transform:scale(0.97); }
.auth-btn-primary { background:var(--accent); color:white; }
.auth-btn-secondary { background:var(--surface2); color:var(--text); border:1px solid var(--border) !important; }
.auth-btn-blue { background:var(--accent2); color:white; }
.auth-divider { text-align:center; color:var(--text2); font-size:13px; margin:16px 0; }
.auth-error { background:rgba(239,68,68,.15); color:var(--danger); padding:10px 14px; border-radius:10px; font-size:13px; margin-bottom:12px; }
.auth-sub { text-align:center; color:var(--text2); font-size:13px; margin-top:12px; }
.settings-section { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px; margin-bottom:12px; }
.settings-label { font-size:11px; color:var(--text2); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-family:'Space Mono',monospace; }
.settings-value { font-size:16px; font-weight:500; }
.bus-code-display { font-family:'Space Mono',monospace; font-size:24px; font-weight:700; color:var(--accent); letter-spacing:3px; text-align:center; padding:16px; background:var(--surface2); border-radius:12px; margin:8px 0; cursor:pointer; }
.member-item { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); }
.member-item:last-child { border:none; }
.member-name { font-weight:500; }
.member-role { font-size:12px; color:var(--text2); font-family:'Space Mono',monospace; }
.member-remove { background:none; border:1px solid var(--danger); color:var(--danger); padding:6px 12px; border-radius:8px; font-size:12px; cursor:pointer; font-family:'DM Sans',sans-serif; }
.member-activate { background:none; border:1px solid var(--success); color:var(--success); padding:6px 12px; border-radius:8px; font-size:12px; cursor:pointer; font-family:'DM Sans',sans-serif; }
.header { background:linear-gradient(135deg,#0f2027,#203a43,#2c5364); padding:20px 16px 16px; position:sticky; top:0; z-index:50; border-bottom:1px solid var(--border); }
.header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.logo-text { font-family:'Space Mono',monospace; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--accent); }
.title { font-size:18px; font-weight:700; color:white; }
.user-badge { font-size:11px; color:var(--accent); font-family:'Space Mono',monospace; margin-top:2px; }
.cart-btn { position:relative; background:var(--accent); border:none; border-radius:12px; padding:10px 16px; color:white; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:8px; font-family:'DM Sans',sans-serif; }
.cart-btn:active { transform:scale(0.95); }
.cart-badge { position:absolute; top:-6px; right:-6px; background:var(--danger); color:white; font-size:11px; font-weight:700; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid var(--bg); }
.breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text2); padding:0 4px; }
.breadcrumb span { cursor:pointer; }
.breadcrumb .active { color:var(--text); font-weight:500; }
.breadcrumb .sep { color:var(--border); }
.van-view { padding:0; }
.van-svg-container { background:var(--surface); border-radius:var(--radius); padding:24px 16px; border:1px solid var(--border); margin-bottom:16px; }
.van-svg-container svg { width:100%; height:auto; display:block; }
.side-cards { display:flex; gap:12px; }
.side-card { flex:1; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px 16px; cursor:pointer; transition:all .2s; text-align:center; position:relative; overflow:hidden; }
.side-card:active { transform:scale(0.97); }
.side-card:hover { border-color:var(--accent); }
.side-card .icon { font-size:32px; margin-bottom:8px; }
.side-card .label { font-weight:700; font-size:15px; margin-bottom:4px; }
.side-card .sub { font-size:12px; color:var(--text2); }
.side-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:var(--accent); transform:scaleX(0); transition:transform .3s; }
.side-card:hover::after { transform:scaleX(1); }
.drawer-list { padding:0; }
.shelf-wrap { margin:0 auto; }
.shelf-linker { width:90%; }
.shelf-rechter { width:85%; }
.shelf-title { font-size:11px; color:var(--text2); font-family:'Space Mono',monospace; letter-spacing:2px; text-transform:uppercase; text-align:center; margin-bottom:12px; }
.shelf-cab { position:relative; background:linear-gradient(170deg,#1e2a38,var(--surface)); border:1px solid var(--border); border-radius:10px; }
.shelf-top { height:14px; background:linear-gradient(180deg,#343e4e,#2a374a); border-radius:10px 10px 0 0; border-bottom:1px solid var(--border); position:relative; }
.shelf-top::after { content:''; position:absolute; top:2px; left:20px; right:20px; height:1px; background:rgba(255,255,255,0.05); }
.shelf-cols { display:flex; }
.shelf-col { flex:1; display:flex; flex-direction:column; padding:16px 16px 10px; }
.shelf-col:first-child { border-right:1px solid rgba(255,255,255,0.03); }
.shelf-col-label { font-size:10px; font-family:'Space Mono',monospace; color:var(--text2); text-align:center; margin-bottom:6px; letter-spacing:1px; }
.shelf-open { height:28px; border:1px dashed rgba(255,255,255,0.06); border-radius:4px; margin-bottom:8px; display:flex; align-items:center; justify-content:center; font-size:9px; color:var(--text2); font-family:'Space Mono',monospace; letter-spacing:1px; opacity:0.5; }
.shelf-drawers { display:flex; flex-direction:column; gap:4px; }
.shelf-base { display:flex; justify-content:space-between; padding:0 12px; }
.shelf-leg { width:20px; height:14px; background:linear-gradient(180deg,#1e2a38,#151e2a); border-radius:0 0 4px 4px; border:1px solid var(--border); border-top:none; }
.shelf-rail { position:absolute; top:0; bottom:0; width:14px; z-index:2; background:linear-gradient(90deg,#1a2535,#212f42); }
.shelf-rail-l { left:-1px; border-radius:10px 0 0 10px; border-right:1px solid rgba(255,255,255,0.04); }
.shelf-rail-r { right:-1px; border-radius:0 10px 10px 0; border-left:1px solid rgba(255,255,255,0.04); }
.shelf-rail-m { left:50%; transform:translateX(-50%); width:10px; background:#1a2535; border-left:1px solid rgba(255,255,255,0.03); border-right:1px solid rgba(255,255,255,0.03); border-radius:0; }
.sdr {
  position:relative; height:44px; border-radius:5px; cursor:pointer;
  display:flex; align-items:center; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
.sdr-face {
  position:absolute; inset:0; border-radius:5px;
  background:linear-gradient(180deg,#2a374a 0%,#232e3e 40%,#1e2938 100%);
  border:1px solid var(--border); transition:all 0.3s;
}
.sdr-face::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent); }
.sdr:hover .sdr-face { background:linear-gradient(180deg,#2f3f55,#283850,#233048); border-color:var(--accent); }
.sdr:hover { transform:translateX(10px); }
.sdr:active { transform:translateX(18px); }
.sdr-acc { position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:3px; background:var(--accent); opacity:0; transition:opacity 0.3s; z-index:5; }
.sdr:hover .sdr-acc { opacity:0.7; }
.sdr-handle-w { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:2; }
.sdr-handle { width:44px; height:10px; border-radius:5px; background:linear-gradient(180deg,#3a4a5e,#2d3b4e); border:1px solid rgba(255,255,255,0.08); box-shadow:0 1px 3px rgba(0,0,0,0.3); transition:all 0.3s; position:relative; }
.sdr-handle::after { content:''; position:absolute; top:2px; left:10px; right:10px; height:3px; border-radius:2px; background:var(--text2); transition:background 0.3s; }
.sdr:hover .sdr-handle { border-color:rgba(249,115,22,0.4); }
.sdr:hover .sdr-handle::after { background:var(--accent); }
.sdr-lbl { position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:16px; font-weight:700; color:var(--accent); font-family:'Space Mono',monospace; z-index:2; pointer-events:none; transition:all 0.3s; white-space:nowrap; opacity:0.7; }
.sdr:hover .sdr-lbl { color:var(--accent); opacity:1; text-shadow:0 0 10px rgba(249,115,22,0.3); }
.sdr-badge { position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:10px; font-weight:700; font-family:'Space Mono',monospace; z-index:2; padding:2px 8px; border-radius:8px; pointer-events:none; transition:all 0.3s; background:rgba(249,115,22,0.12); color:var(--accent2); border:1px solid rgba(249,115,22,0.2); max-width:45%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sdr:hover .sdr-badge { background:rgba(249,115,22,0.2); color:var(--accent); border-color:rgba(249,115,22,0.4); }
.sdr.info .sdr-face { opacity:0.4; }
.sdr.info .sdr-lbl { opacity:0.4; }
.sdr.info .sdr-badge { background:rgba(255,255,255,0.04); color:var(--text2); border-color:rgba(255,255,255,0.06); opacity:0.6; font-family:'DM Sans',sans-serif; font-size:9px; }
.sdr.info:hover .sdr-face { opacity:0.6; border-color:var(--text2); }
.sdr.info:hover .sdr-lbl { opacity:0.7; }
.sdr.info:hover { transform:translateX(6px); }
.sdr.info .sdr-acc { background:var(--text2); }
.sdr-single .shelf-cols { display:block; }
.sdr-single .shelf-col { border:none !important; }
.article-list { padding:0; }
.article-item { display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:12px; margin-bottom:8px; cursor:pointer; transition:all .2s; }
.article-item:active { transform:scale(0.98); background:var(--surface2); }
.article-item img { width:48px; height:48px; border-radius:8px; object-fit:cover; background:#fff; flex-shrink:0; }
.article-info { flex:1; min-width:0; }
.article-name { font-size:13px; font-weight:500; line-height:1.3; }
.article-code { font-family:'Space Mono',monospace; font-size:11px; color:var(--text2); margin-top:2px; }
.article-qty-badge { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:4px 10px; font-size:11px; color:var(--text2); white-space:nowrap; flex-shrink:0; }
.add-icon { width:36px; height:36px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:20px; color:white; font-weight:700; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn .2s; }
@keyframes fadeIn { from{opacity:0;} }
.modal-sheet { background:var(--surface); border-radius:20px 20px 0 0; padding:24px 20px 40px; width:100%; animation:slideUp .3s; }
@keyframes slideUp { from{transform:translateY(100%);} }
.modal-handle { width:40px; height:4px; background:var(--border); border-radius:2px; margin:0 auto 20px; }
.modal-title { font-size:16px; font-weight:700; margin-bottom:4px; }
.modal-sub { font-size:13px; color:var(--text2); margin-bottom:20px; }
.qty-controls { display:flex; align-items:center; justify-content:center; gap:20px; margin-bottom:24px; }
.qty-btn { width:48px; height:48px; border-radius:50%; border:2px solid var(--border); background:var(--surface2); color:var(--text); font-size:24px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; font-family:'DM Sans',sans-serif; }
.qty-btn:active { transform:scale(0.9); background:var(--accent); border-color:var(--accent); }
.qty-display { font-family:'Space Mono',monospace; font-size:36px; font-weight:700; min-width:60px; text-align:center; color:var(--accent); }
.modal-actions { display:flex; gap:10px; }
.modal-actions button { flex:1; padding:14px; border-radius:12px; border:none; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
.modal-actions button:active { transform:scale(0.97); }
.btn-cancel { background:var(--surface2); color:var(--text); border:1px solid var(--border) !important; }
.btn-add { background:var(--accent); color:white; }
.cart-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn .2s; }
.cart-sheet { background:var(--surface); border-radius:20px 20px 0 0; padding:24px 20px 40px; width:100%; max-height:85vh; display:flex; flex-direction:column; animation:slideUp .3s; }
.cart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.cart-title { font-size:18px; font-weight:700; }
.cart-close { background:none; border:none; color:var(--text2); font-size:28px; cursor:pointer; padding:0 4px; }
.cart-items { flex:1; overflow-y:auto; margin-bottom:16px; }
.cart-item { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border); }
.cart-item-info { flex:1; min-width:0; }
.cart-item-name { font-size:13px; font-weight:500; }
.cart-item-code { font-size:11px; color:var(--text2); font-family:'Space Mono',monospace; }
.cart-item-qty { font-family:'Space Mono',monospace; font-size:16px; font-weight:700; color:var(--accent); min-width:30px; text-align:center; }
.cart-item-del { background:none; border:none; color:var(--danger); font-size:18px; cursor:pointer; padding:8px; }
.cart-item-by { font-size:10px; color:var(--text2); }
.cart-empty { text-align:center; color:var(--text2); padding:40px 0; font-size:14px; }
.cart-actions { display:flex; flex-direction:column; gap:8px; }
.cart-actions button { padding:14px; border-radius:12px; border:none; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
.cart-actions button:active { transform:scale(0.97); }
.btn-email { background:var(--success); color:white; }
.btn-clear { background:var(--surface2); color:var(--text2); border:1px solid var(--border) !important; }
.toast { position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:var(--success); color:white; padding:12px 24px; border-radius:12px; font-weight:700; font-size:14px; z-index:200; animation:toastIn .3s; box-shadow:0 8px 24px rgba(0,0,0,.4); }
@keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(20px);} }
.search-bar { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:10px 14px; display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.search-bar input { background:none; border:none; color:var(--text); font-size:14px; width:100%; outline:none; font-family:'DM Sans',sans-serif; }
.search-bar input::placeholder { color:var(--text2); }
.search-icon { color:var(--text2); font-size:16px; flex-shrink:0; }

/* ── Responsive: tablets ── */
@media (max-width: 768px) {
  .shelf-linker, .shelf-rechter { width:95%; }
  .shelf-col { padding:14px 12px 10px; }
  .sdr { height:42px; }
  .sdr-lbl { font-size:14px; left:8px; }
  .sdr-badge { font-size:9px; right:8px; padding:2px 6px; max-width:40%; }
  .sdr-handle { width:36px; height:9px; }
  .sdr-handle::after { left:8px; right:8px; }
  .shelf-col-label { font-size:9px; }
}

/* ── Responsive: phones ── */
@media (max-width: 480px) {
  .shelf-linker, .shelf-rechter { width:100%; }
  .shelf-cab { border-radius:8px; }
  .shelf-top { height:10px; border-radius:8px 8px 0 0; }
  .shelf-col { padding:10px 8px 8px; }
  .shelf-cols { gap:0; }
  .shelf-open { height:22px; font-size:8px; margin-bottom:6px; }
  .shelf-drawers { gap:3px; }
  .shelf-rail { width:10px; }
  .shelf-rail-m { width:6px; }
  .sdr { height:38px; }
  .sdr:hover { transform:translateX(6px); }
  .sdr-lbl { font-size:12px; left:6px; }
  .sdr-badge { font-size:8px; right:6px; padding:2px 5px; max-width:38%; }
  .sdr-handle { width:30px; height:8px; }
  .sdr-handle::after { left:6px; right:6px; height:2px; top:2px; }
  .shelf-col-label { font-size:8px; letter-spacing:1px; margin-bottom:4px; }
  .shelf-title { font-size:10px; letter-spacing:1px; margin-bottom:8px; }
  .shelf-base { padding:0 8px; }
  .shelf-leg { width:16px; height:12px; }
  .title { font-size:16px; }
  .user-badge { font-size:10px; }
  .header { padding:14px 12px 12px; }
  .header-top { margin-bottom:8px; }
  .breadcrumb { font-size:11px; }
}

/* ── Responsive: very small phones ── */
@media (max-width: 370px) {
  .sdr { height:34px; }
  .sdr-lbl { font-size:10px; left:5px; }
  .sdr-badge { font-size:7px; right:4px; padding:1px 4px; max-width:35%; }
  .sdr-handle { width:24px; height:7px; }
  .shelf-col { padding:8px 6px 6px; }
  .shelf-open { height:18px; font-size:7px; }
  .shelf-col-label { font-size:7px; }
}
`;

// ─── ICONS ──────────────────────────────────────────────────────────────
const IconCart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const IconGear = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

const VanSVG = ({ onClickLeft, onClickRight }) => (
  <svg viewBox="0 0 800 350" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="30" width="720" height="290" rx="16" fill="#1c2533" stroke="#2a3545" strokeWidth="2"/>
    <rect x="620" y="60" width="120" height="230" rx="12" fill="#161d27" stroke="#2a3545" strokeWidth="1.5"/>
    <circle cx="680" cy="150" r="28" fill="none" stroke="#3b82f6" strokeWidth="2" opacity=".6"/>
    <circle cx="680" cy="150" r="6" fill="#3b82f6" opacity=".4"/>
    <rect x="450" y="280" width="160" height="8" rx="4" fill="#f97316" opacity=".5"/>
    <text x="530" y="310" textAnchor="middle" fill="#f97316" fontSize="11" fontFamily="Space Mono, monospace" opacity=".7">SCHUIFDEUR</text>
    <g onClick={onClickLeft} style={{cursor:'pointer'}}><rect x="80" y="60" width="500" height="90" rx="10" fill="#1c2533" stroke="#f97316" strokeWidth="2" strokeDasharray="6 3"/><rect x="80" y="60" width="500" height="90" rx="10" fill="#f97316" opacity=".08"/><text x="330" y="100" textAnchor="middle" fill="#f97316" fontSize="13" fontFamily="DM Sans" fontWeight="700">LINKER STELLING</text><text x="330" y="118" textAnchor="middle" fill="#8896a8" fontSize="11" fontFamily="Space Mono, monospace">12 laden • Prestabo / Profipress / Gas</text></g>
    <g onClick={onClickRight} style={{cursor:'pointer'}}><rect x="130" y="190" width="300" height="70" rx="10" fill="#1c2533" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 3"/><rect x="130" y="190" width="300" height="70" rx="10" fill="#3b82f6" opacity=".08"/><text x="280" y="222" textAnchor="middle" fill="#3b82f6" fontSize="13" fontFamily="DM Sans" fontWeight="700">RECHTER STELLING</text><text x="280" y="240" textAnchor="middle" fill="#8896a8" fontSize="11" fontFamily="Space Mono, monospace">7 laden • Knel / Malleabel / Las</text></g>
  </svg>
);

// ─── SHELF DRAWER ───────────────────────────────────────────────────────
const ShelfDrawer = ({ name, items, onClick }) => {
  const isInfo = items && items._info;
  const count = Array.isArray(items) ? items.length : 0;
  const isEmpty = !isInfo && count === 0;
  const badgeText = isInfo ? items._info.replace(/^[^\s]+\s/, '') : count > 0 ? `${count} art.` : "leeg";

  return (
    <div className={`sdr ${isInfo ? 'info' : ''} ${isEmpty ? 'info' : ''}`}
         onClick={() => { if (!isEmpty || isInfo) onClick(name); }}
         style={isEmpty && !isInfo ? {opacity:0.3,cursor:'default'} : {}}>
      <div className="sdr-acc"/>
      <div className="sdr-face"/>
      <span className="sdr-lbl">{name}</span>
      <div className="sdr-handle-w"><div className="sdr-handle"/></div>
      <span className="sdr-badge">{badgeText}</span>
    </div>
  );
};

const ShelfView = ({ side, data, onOpenDrawer }) => {
  const entries = Object.entries(data);

  if (side === "rechter") {
    return (
      <div className="shelf-wrap shelf-rechter">
        <div className="shelf-title">7 laden • Knel / Malleabel / Las</div>
        <div className="shelf-cab sdr-single">
          <div className="shelf-top"/>
          <div className="shelf-rail shelf-rail-l"/>
          <div className="shelf-rail shelf-rail-r"/>
          <div className="shelf-cols">
            <div className="shelf-col">
              <div className="shelf-open">open plank</div>
              <div className="shelf-drawers">
                {entries.map(([name, items]) => (
                  <ShelfDrawer key={name} name={name} items={items} onClick={onOpenDrawer} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="shelf-base"><div className="shelf-leg"/><div className="shelf-leg"/></div>
      </div>
    );
  }

  // Linker stelling: split 1-7 left, 8-12 right
  const leftEntries = entries.filter(([n]) => { const num = parseInt(n.replace("Lade ","")); return num <= 7; });
  const rightEntries = entries.filter(([n]) => { const num = parseInt(n.replace("Lade ","")); return num > 7; });

  return (
    <div className="shelf-wrap shelf-linker">
      <div className="shelf-title">12 laden • Prestabo / Profipress / Gas</div>
      <div className="shelf-cab">
        <div className="shelf-top"/>
        <div className="shelf-rail shelf-rail-l"/>
        <div className="shelf-rail shelf-rail-m"/>
        <div className="shelf-rail shelf-rail-r"/>
        <div className="shelf-cols">
          <div className="shelf-col">
            <div className="shelf-col-label">1267 MM</div>
            <div className="shelf-open">open plank</div>
            <div className="shelf-drawers">
              {leftEntries.map(([name, items]) => (
                <ShelfDrawer key={name} name={name} items={items} onClick={onOpenDrawer} />
              ))}
            </div>
          </div>
          <div className="shelf-col">
            <div className="shelf-col-label">967 MM</div>
            <div className="shelf-open">open plank</div>
            <div className="shelf-drawers">
              {rightEntries.map(([name, items]) => (
                <ShelfDrawer key={name} name={name} items={items} onClick={onOpenDrawer} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="shelf-base"><div className="shelf-leg"/><div className="shelf-leg"/><div className="shelf-leg"/></div>
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [busInfo, setBusInfo] = useState(null);
  const [authScreen, setAuthScreen] = useState("welcome");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authBusName, setAuthBusName] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [side, setSide] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [latestInviteCode, setLatestInviteCode] = useState("");
  const [approvedCreators, setApprovedCreators] = useState([]);
  const [newCreatorEmail, setNewCreatorEmail] = useState("");
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [allBusMembers, setAllBusMembers] = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [reloginBusCode, setReloginBusCode] = useState("");
  const [reloginPassword, setReloginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [modal, setModal] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const toastTimer = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
  (async () => {
    try {
      const raw = localStorage.getItem("my-session");
      const sess = raw ? JSON.parse(raw) : null;

      if (!sess) {
        setLoading(false);
        return;
      }

      setSession(sess);

      const { data: busRow, error: busError } = await supabase
        .from("buses")
        .select("*")
        .eq("code", sess.busCode)
        .maybeSingle();

      if (busError || !busRow) {
        setLoading(false);
        return;
      }

      const { data: memberRows, error: memberError } = await supabase
        .from("bus_members")
        .select("*")
        .eq("bus_code", sess.busCode);

      const members = memberError || !memberRows
        ? []
        : memberRows
            .filter(m => m.active !== false)
            .map(m => ({
              id: m.member_id,
              name: m.name,
              role: m.role,
            }));

      setBusInfo({
        name: busRow.name,
        code: busRow.code,
        ownerEmail: busRow.owner_email,
        members,
      });

      const { data: orderRow } = await supabase
        .from("bus_orders")
        .select("*")
        .eq("bus_code", sess.busCode)
        .maybeSingle();

      setCart(orderRow?.items || []);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  })();
}, []);

const refreshData = useCallback(async () => {
  if (!session) return;

  const { data: orderRow } = await supabase
    .from("bus_orders")
    .select("*")
    .eq("bus_code", session.busCode)
    .maybeSingle();

  setCart(orderRow?.items || []);

  const { data: busRow } = await supabase
    .from("buses")
    .select("*")
    .eq("code", session.busCode)
    .maybeSingle();

  const { data: memberRows } = await supabase
    .from("bus_members")
    .select("*")
    .eq("bus_code", session.busCode);

  const members = (memberRows || [])
    .filter(m => m.active !== false)
    .map(m => ({
      id: m.member_id,
      name: m.name,
      role: m.role,
    }));

  if (!busRow || !members.some(m => m.id === session.userId)) {
    localStorage.removeItem("my-session");
    setSession(null);
    setBusInfo(null);
    setCart([]);
    setShowSettings(false);
    return;
  }

  setBusInfo({
    name: busRow.name,
    code: busRow.code,
    ownerEmail: busRow.owner_email,
    members,
  });
}, [session]);

useEffect(() => {
  if (!session) return;
  pollRef.current = setInterval(refreshData, 3000);
  return () => clearInterval(pollRef.current);
}, [session, refreshData]);

const saveCart = async (nc) => {
  setCart(nc);

  if (!session) return;

  await supabase
    .from("bus_orders")
    .update({
      items: nc,
      updated_at: new Date().toISOString(),
    })
    .eq("bus_code", session.busCode);
};

const createBus = async () => {
  const name = authName.trim();
  const email = authEmail.trim().toLowerCase();
  const busName = authBusName.trim();
  const password = authPassword.trim();

  if (!name || !email || !busName || !password) {
    setAuthError("Vul alle velden in");
    return;
  }

  if (password.length < 6) {
    setAuthError("Wachtwoord moet minimaal 6 tekens bevatten");
    return;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    setAuthError("Vul een geldig e-mailadres in");
    return;
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("email, role")
    .eq("email", email)
    .maybeSingle();

  if (adminError) {
    setAuthError("Controle van beheerder mislukt");
    return;
  }

  const { data: creatorRow, error: creatorError } = await supabase
    .from("approved_creators")
    .select("email, active, single_use, used_at")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (creatorError) {
    setAuthError("Controle van toegestane e-mail mislukt");
    return;
  }

  const isAllowed = !!adminRow || !!creatorRow;

  if (!isAllowed) {
    setAuthError("Dit e-mailadres is niet gemachtigd om een nieuwe bus aan te maken");
    return;
  }

  if (creatorRow?.single_use && creatorRow?.used_at) {
    setAuthError("Dit e-mailadres is al gebruikt om een bus aan te maken");
    return;
  }

  const userId = genId();
  const code = genBusCode();

  const { error: busInsertError } = await supabase
  .from("buses")
  .insert({
    code,
    name: busName,
    owner_email: email,
    owner_name: name,
    login_password: password,
  });

  if (busInsertError) {
    setAuthError("Bus opslaan mislukt");
    return;
  }

  if (creatorRow?.single_use) {
    await supabase
      .from("approved_creators")
      .update({
        used_at: new Date().toISOString(),
        used_by_bus_code: code,
      })
      .eq("email", email);
  }

  const { error: memberInsertError } = await supabase
    .from("bus_members")
    .insert({
      bus_code: code,
      member_id: userId,
      name,
      role: "monteur",
    });

  if (memberInsertError) {
    setAuthError("Buslid opslaan mislukt");
    return;
  }

  const { error: orderInsertError } = await supabase
    .from("bus_orders")
    .insert({
      bus_code: code,
      items: [],
    });

  if (orderInsertError) {
    setAuthError("Bestellijst aanmaken mislukt");
    return;
  }

  const sess = {
    userId,
    name,
    email,
    busCode: code,
    role: "monteur",
  };

  localStorage.setItem("my-session", JSON.stringify(sess));

  setSession(sess);
  setBusInfo({
    name: busName,
    code,
    ownerEmail: email,
    members: [{ id: userId, name, role: "monteur" }],
  });
  setCart([]);
  setAuthPassword("");
  setAuthError("");
};

const joinBus = async () => {
  const name = authName.trim();
  const inviteCode = authCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (!name || !inviteCode) {
    setAuthError("Vul alle velden in");
    return;
  }

  const { data: inviteRow, error: inviteError } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("invite_code", inviteCode)
    .eq("is_used", false)
    .maybeSingle();

  if (inviteError || !inviteRow) {
    setAuthError(`Uitnodigingscode "${inviteCode}" is niet geldig of is al gebruikt.`);
    return;
  }

  const busCode = inviteRow.bus_code;

  const { data: busRow, error: busError } = await supabase
    .from("buses")
    .select("*")
    .eq("code", busCode)
    .maybeSingle();

  if (busError || !busRow) {
    setAuthError("Bus niet gevonden");
    return;
  }

  const { data: memberRows, error: memberError } = await supabase
    .from("bus_members")
    .select("*")
    .eq("bus_code", busCode);

  if (memberError) {
    setAuthError("Leden laden mislukt");
    return;
  }

  const nameExists = (memberRows || []).some(
    m => m.name.toLowerCase() === name.toLowerCase()
  );

  if (nameExists) {
    setAuthError("Er is al iemand met deze naam in deze bus");
    return;
  }

  const userId = genId();

  const { error: insertMemberError } = await supabase
    .from("bus_members")
    .insert({
      bus_code: busCode,
      member_id: userId,
      name,
      role: "hulpmonteur",
    });

  if (insertMemberError) {
    setAuthError("Toevoegen aan bus mislukt");
    return;
  }

  const { error: updateInviteError } = await supabase
    .from("invite_codes")
    .update({
      is_used: true,
      used_by_name: name,
      used_at: new Date().toISOString(),
    })
    .eq("id", inviteRow.id);

  if (updateInviteError) {
    setAuthError("Uitnodigingscode bijwerken mislukt");
    return;
  }

  const sess = {
    userId,
    name,
    busCode,
    role: "hulpmonteur",
  };

  localStorage.setItem("my-session", JSON.stringify(sess));

  const updatedMembers = [
    ...(memberRows || []).map(m => ({
      id: m.member_id,
      name: m.name,
      role: m.role,
    })),
    { id: userId, name, role: "hulpmonteur" },
  ];

  const { data: orderRow } = await supabase
    .from("bus_orders")
    .select("*")
    .eq("bus_code", busCode)
    .maybeSingle();

  setSession(sess);
  setBusInfo({
    name: busRow.name,
    code: busRow.code,
    ownerEmail: busRow.owner_email,
    members: updatedMembers,
  });
  setCart(orderRow?.items || []);
  setAuthError("");
  setLatestInviteCode("");
};

const removeMember = async (mid) => {
  if (!busInfo || session.role !== "monteur") return;

  const { error } = await supabase
    .from("bus_members")
    .delete()
    .eq("bus_code", busInfo.code)
    .eq("member_id", mid);

  if (error) {
    console.error("Remove member error:", error);
    showToastMsg("Hulpmonteur verwijderen mislukt");
    return;
  }

  const updatedMembers = busInfo.members.filter(m => m.id !== mid);

  setBusInfo({
    ...busInfo,
    members: updatedMembers,
  });

  await cleanupEmptyBus(busInfo.code);
  await refreshData();

  showToastMsg("Hulpmonteur verwijderd");
};

const createInviteCode = async () => {
  if (!busInfo || session?.role !== "monteur") return;

  const inviteCode = genInviteCode();

  const { error } = await supabase
    .from("invite_codes")
    .insert({
      bus_code: busInfo.code,
      invite_code: inviteCode,
      created_by: session.name,
      is_used: false,
    });

  if (error) {
    setAuthError("Uitnodigingscode aanmaken mislukt");
    showToastMsg("Uitnodigingscode aanmaken mislukt");
    return;
  }

  setLatestInviteCode(inviteCode);
  showToastMsg("Nieuwe uitnodigingscode gemaakt");
};

const reloginExistingBus = async () => {
  const busCode = reloginBusCode.trim().toUpperCase();
  const password = reloginPassword.trim();

  if (!busCode || !password) {
    setAuthError("Vul buscode en wachtwoord in");
    return;
  }

  const { data: busRow, error: busError } = await supabase
    .from("buses")
    .select("*")
    .eq("code", busCode)
    .maybeSingle();

  if (busError || !busRow) {
    setAuthError("Bus niet gevonden");
    return;
  }

  if ((busRow.login_password || "") !== password) {
    setAuthError("Buscode of wachtwoord is onjuist");
    return;
  }

  const { data: memberRows, error: memberError } = await supabase
    .from("bus_members")
    .select("*")
    .eq("bus_code", busCode);

  if (memberError) {
    setAuthError("Busleden laden mislukt");
    return;
  }

  const ownerMember = (memberRows || []).find(
    m => m.role === "monteur" && m.name === busRow.owner_name && m.active !== false
  );

  if (!ownerMember) {
    setAuthError("Hoofdmonteur niet gevonden");
    return;
  }

  const sess = {
    userId: ownerMember.member_id,
    name: ownerMember.name,
    email: busRow.owner_email,
    busCode: busRow.code,
    role: "monteur",
  };

  localStorage.setItem("my-session", JSON.stringify(sess));

  setSession(sess);
  setBusInfo({
    name: busRow.name,
    code: busRow.code,
    ownerEmail: busRow.owner_email,
    members: (memberRows || [])
      .filter(m => m.active !== false)
      .map(m => ({
        id: m.member_id,
        name: m.name,
        role: m.role,
      })),
  });

  const { data: orderRow } = await supabase
    .from("bus_orders")
    .select("*")
    .eq("bus_code", busRow.code)
    .maybeSingle();

  setCart(orderRow?.items || []);
  setAuthError("");
  setReloginBusCode("");
  setReloginPassword("");
  setLatestInviteCode("");
  showToastMsg("Opnieuw ingelogd");
};

const changeBusPassword = async () => {
  if (!session || session.role !== "monteur" || !busInfo?.code) {
    showToastMsg("Alleen de monteur kan het wachtwoord wijzigen");
    return;
  }

  const password = newPassword.trim();
  const confirm = confirmNewPassword.trim();

  if (!password || !confirm) {
    showToastMsg("Vul beide wachtwoordvelden in");
    return;
  }

  if (password.length < 6) {
    showToastMsg("Wachtwoord moet minimaal 6 tekens bevatten");
    return;
  }

  if (password !== confirm) {
    showToastMsg("Wachtwoorden komen niet overeen");
    return;
  }

  const { error } = await supabase
    .from("buses")
    .update({ login_password: password })
    .eq("code", busInfo.code);

  if (error) {
    console.error("Change password error:", error);
    showToastMsg("Wachtwoord wijzigen mislukt");
    return;
  }

  setNewPassword("");
  setConfirmNewPassword("");
  showToastMsg("Wachtwoord gewijzigd");
};

const setTemporaryPassword = async (busCode) => {
  const tempPassword = "Temp" + Math.floor(1000 + Math.random() * 9000);

  if (!confirm("Nieuw tijdelijk wachtwoord genereren?")) return;

  const { error } = await supabase
    .from("buses")
    .update({ login_password: tempPassword })
    .eq("code", busCode);

  if (error) {
    console.error("Temp password error:", error);
    showToastMsg("Tijdelijk wachtwoord instellen mislukt");
    return;
  }

  showToastMsg(`Tijdelijk wachtwoord: ${tempPassword}`);
};

  const loadApprovedCreators = async () => {
  const currentEmail = (session?.email || busInfo?.ownerEmail || "").toLowerCase();
  const mainAdminEmail = "m.slootemaker@bonarius.com";
  const admin = currentEmail === mainAdminEmail;

  setIsMainAdmin(admin);

  if (!admin) {
    setApprovedCreators([]);
    return;
  }

  const { data, error } = await supabase
    .from("approved_creators")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load error:", error);
    return;
  }

  setApprovedCreators(data || []);
};

const loadAdminOverview = async () => {
  const currentEmail = (session?.email || busInfo?.ownerEmail || "").toLowerCase();
  const mainAdminEmail = "m.slootemaker@bonarius.com";
  const admin = currentEmail === mainAdminEmail;

  setIsMainAdmin(admin);

  if (!admin) {
    setAllBusMembers([]);
    setAllBuses([]);
    return;
  }

  const { data: busesData, error: busesError } = await supabase
    .from("buses")
    .select("*")
    .order("name", { ascending: true });

  const { data: membersData, error: membersError } = await supabase
    .from("bus_members")
    .select("*")
    .order("bus_code", { ascending: true });

  if (busesError) {
    console.error("Admin buses load error:", busesError);
  } else {
    setAllBuses(busesData || []);
  }

  if (membersError) {
    console.error("Admin members load error:", membersError);
  } else {
    setAllBusMembers(membersData || []);
  }
};

const addApprovedCreator = async () => {
  const email = newCreatorEmail.trim().toLowerCase();

  if (!email) {
    showToastMsg("Vul een e-mailadres in");
    return;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    showToastMsg("Vul een geldig e-mailadres in");
    return;
  }

  const { error } = await supabase
    .from("approved_creators")
    .upsert(
      {
        email,
        active: true,
        single_use: true,
        used_at: null,
        used_by_bus_code: null,
        created_by: session?.email || busInfo?.ownerEmail || "admin",
      },
      { onConflict: "email" }
    );

  if (error) {
    console.error("approved_creators add error:", error);
    showToastMsg(`Toevoegen mislukt: ${error.message}`);
    return;
  }

  setNewCreatorEmail("");
  showToastMsg("Monteur toegevoegd");
  await loadApprovedCreators();
};

const removeApprovedCreator = async (email) => {
  const { error } = await supabase
    .from("approved_creators")
    .update({ active: false })
    .eq("email", email);

  if (error) {
    console.error("Deactivate error:", error);
    showToastMsg("Deactiveren mislukt");
    return;
  }

  showToastMsg("Monteur gedeactiveerd");
  await loadApprovedCreators();
};

const reactivateApprovedCreator = async (email) => {
  const { error } = await supabase
    .from("approved_creators")
    .update({ active: true })
    .eq("email", email);

  if (error) {
    console.error("Reactivate error:", error);
    showToastMsg("Activeren mislukt");
    return;
  }

  showToastMsg("Monteur opnieuw geactiveerd");
  await loadApprovedCreators();
};

const deactivateBusMember = async (memberId, busCode) => {
  const { error } = await supabase
    .from("bus_members")
    .update({ active: false })
    .eq("member_id", memberId)
    .eq("bus_code", busCode);

  if (error) {
    console.error("Deactivate bus member error:", error);
    showToastMsg("Buslid deactiveren mislukt");
    return;
  }

  showToastMsg("Buslid gedeactiveerd");
  await loadAdminOverview();
  await refreshData();
};

const reactivateBusMember = async (memberId, busCode) => {
  const { error } = await supabase
    .from("bus_members")
    .update({ active: true })
    .eq("member_id", memberId)
    .eq("bus_code", busCode);

  if (error) {
    console.error("Reactivate bus member error:", error);
    showToastMsg("Buslid activeren mislukt");
    return;
  }

  showToastMsg("Buslid geactiveerd");
  await loadAdminOverview();
  await refreshData();
};

const deleteBusMemberAdmin = async (memberId, busCode) => {
  const { error } = await supabase
    .from("bus_members")
    .delete()
    .eq("member_id", memberId)
    .eq("bus_code", busCode);

  if (error) {
    console.error("Delete bus member error:", error);
    showToastMsg("Buslid verwijderen mislukt");
    return;
  }

  setAllBusMembers(prev =>
    prev.filter(m => !(m.member_id === memberId && m.bus_code === busCode))
  );

  await cleanupEmptyBus(busCode);
  await loadAdminOverview();
  await refreshData();

  showToastMsg("Buslid verwijderd");
};

const cleanupEmptyBus = async (busCode) => {
  const { data: remainingMembers, error: membersError } = await supabase
    .from("bus_members")
    .select("member_id")
    .eq("bus_code", busCode);

  if (membersError) {
    console.error("Cleanup members check error:", membersError);
    return;
  }

  if ((remainingMembers || []).length > 0) {
    return;
  }

  const { error: inviteDeleteError } = await supabase
    .from("invite_codes")
    .delete()
    .eq("bus_code", busCode);

  if (inviteDeleteError) {
    console.error("Cleanup invite_codes error:", inviteDeleteError);
  }

  const { error: ordersDeleteError } = await supabase
    .from("bus_orders")
    .delete()
    .eq("bus_code", busCode);

  if (ordersDeleteError) {
    console.error("Cleanup bus_orders error:", ordersDeleteError);
  }

  const { error: busDeleteError } = await supabase
    .from("buses")
    .delete()
    .eq("code", busCode);

  if (busDeleteError) {
    console.error("Cleanup buses error:", busDeleteError);
    return;
  }

  setAllBuses(prev => prev.filter(bus => bus.code !== busCode));
  showToastMsg("Lege bus automatisch verwijderd");
};

const deleteApprovedCreatorForever = async (email) => {
  const { error } = await supabase
    .from("approved_creators")
    .delete()
    .eq("email", email);

  if (error) {
    console.error("Delete approved creator error:", error);
    showToastMsg("E-mailadres verwijderen mislukt");
    return;
  }

  showToastMsg("E-mailadres verwijderd");

  setApprovedCreators(prev => prev.filter(row => row.email !== email));

  await loadApprovedCreators();
};

  const openLogoutConfirm = () => {
  setShowLogoutConfirm(true);
};

const confirmLogout = async () => {
  localStorage.removeItem("my-session");
  setSession(null);
  setBusInfo(null);
  setCart([]);
  setAuthScreen("welcome");
  setAuthName("");
  setAuthEmail("");
  setAuthCode("");
  setAuthBusName("");
  setAuthPassword("");
  setNewPassword("");
  setConfirmNewPassword("");
  setAuthError("");
  setView("home");
  setSide(null);
  setDrawer(null);
  setShowLogoutConfirm(false);
};

const cancelLogout = () => {
  setShowLogoutConfirm(false);
};

  const showToastMsg = (m) => { setToast(m); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2000); };

  const addToCart = async (item, amount) => {
    const key = `${item.code}-${side}`;
    const nc = [...cart];
    const idx = nc.findIndex(c => c.key === key);
    if (idx >= 0) nc[idx] = { ...nc[idx], quantity: nc[idx].quantity + amount };
    else nc.push({ key, name: item.name, code: item.code, quantity: amount, addedBy: session?.name || "?" });
    await saveCart(nc);
    showToastMsg(`${amount}x ${item.name} toegevoegd`);
    setModal(null);
  };

  const removeFromCart = async (key) => { await saveCart(cart.filter(c => c.key !== key)); };
  const clearCartAll = async () => { await saveCart([]); };
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const sendEmail = async () => {
  if (cart.length === 0) return;

  let body = `Beste,\n\nOnderstaande materialen komen uit mijn busvoorraad die ik heb gebruikt voor bovengenoemde project. Zou je deze kunnen bestellen op het project zodat ik deze weer kan aanvullen?\n\n`;

  cart.forEach(c => {
    body += `${c.quantity}x ${c.name} (${c.code})\n`;
  });

  window.open(
    `mailto:?subject=${encodeURIComponent("Bestelling voor project")}&body=${encodeURIComponent(body)}`,
    "_self"
  );

  await clearCartAll();
  setShowCart(false);
  showToastMsg("Bestellijst verzonden!");
};

  const goSide = (s) => { setSide(s); setView(s); setSearch(""); };
  const goDrawer = (d) => { setDrawer(d); setView("drawer"); setSearch(""); };
  const goHome = () => { setView("home"); setSide(null); setDrawer(null); setSearch(""); };
  const goBack = () => { if (view === "drawer") { setView(side); setDrawer(null); setSearch(""); } else goHome(); };

  const data = side === "linker" ? LINKER_LADEN : RECHTER_LADEN;
  const drawerData = drawer ? (data[drawer] || []) : [];
  const isInfoDrawer = drawerData && drawerData._info;
  const drawerItems = isInfoDrawer ? [] : (Array.isArray(drawerData) ? drawerData : []);
  const filteredItems = search ? drawerItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.includes(search)) : drawerItems;
  const allDrawerEntries = [...Object.entries(LINKER_LADEN).flatMap(([dn, it]) => Array.isArray(it) ? it.map(i => ({ ...i, side: "linker", drawer: dn })) : []), ...Object.entries(RECHTER_LADEN).flatMap(([dn, it]) => Array.isArray(it) ? it.map(i => ({ ...i, side: "rechter", drawer: dn })) : [])];
  const filteredGlobalItems = globalSearch ? allDrawerEntries.filter(i => i.name.toLowerCase().includes(globalSearch.toLowerCase()) || i.code.includes(globalSearch)) : [];

  if (loading) return <><style>{CSS}</style><div className="auth-wrap"><div style={{color:'var(--text2)'}}>Laden...</div></div></>;

  if (!session) return (
    <><style>{CSS}</style><div className="auth-wrap"><div className="auth-card">
      <div className="auth-logo">
  <img
    src="/logo.png"
    alt="logo"
    style={{ height: "28px", objectFit: "contain", marginRight: 8, verticalAlign: "middle" }}
  />
  Bonarius
</div>

{authScreen === "welcome" && (
  <>
    <div className="auth-title">Voorraadbeheer</div>

    <div style={{ textAlign: "center", color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>
      Beheer de voorraad in je bedrijfsbus samen met je team
    </div>

    <button
      className="auth-btn auth-btn-primary"
      onClick={() => {
        setAuthScreen("create");
        setAuthError("");
      }}
    >
      🚐 Nieuwe bus aanmaken
    </button>

    <div className="auth-divider">of</div>

    <button
      className="auth-btn auth-btn-blue"
      onClick={() => {
        setAuthScreen("join");
        setAuthError("");
      }}
    >
      🔑 Deelnemen aan een bus
    </button>

    <button
      className="auth-btn auth-btn-secondary"
      onClick={() => {
        setAuthScreen("relogin");
        setReloginBusCode("");
        setReloginPassword("");
        setAuthError("");
      }}
    >
      🔐 Opnieuw inloggen op bestaande bus
    </button>
  </>
)}

{authScreen === "create" && (
  <>
    <div className="auth-title">Bus aanmaken</div>

    {authError && <div className="auth-error">{authError}</div>}

    <input
      className="auth-input"
      placeholder="Jouw naam"
      value={authName}
      onChange={e => {
        setAuthName(e.target.value);
        setAuthError("");
      }}
    />

    <input
      className="auth-input"
      placeholder="Jouw e-mailadres"
      value={authEmail}
      onChange={e => {
        setAuthEmail(e.target.value);
        setAuthError("");
      }}
    />

    <input
      className="auth-input"
      placeholder="Naam van de bus (bijv. Movano Marchel)"
      value={authBusName}
      onChange={e => {
        setAuthBusName(e.target.value);
        setAuthError("");
      }}
    />

    <input
      className="auth-input"
      type="password"
      placeholder="Kies een wachtwoord"
      value={authPassword}
      onChange={e => {
        setAuthPassword(e.target.value);
        setAuthError("");
      }}
    />

    <button className="auth-btn auth-btn-primary" onClick={createBus}>
      Bus aanmaken
    </button>

    <button
      className="auth-btn auth-btn-secondary"
      onClick={() => {
        setAuthScreen("welcome");
        setAuthPassword("");
        setAuthError("");
      }}
    >
      Terug
    </button>

    <div className="auth-sub">
      Alleen goedgekeurde e-mailadressen mogen een nieuwe bus aanmaken
    </div>
  </>
)}

{authScreen === "join" && (
  <>
    <div className="auth-title">Deelnemen</div>

    {authError && <div className="auth-error">{authError}</div>}

    <input
      className="auth-input"
      placeholder="Jouw naam"
      value={authName}
      onChange={e => {
        setAuthName(e.target.value);
        setAuthError("");
      }}
    />

    <input
      className="auth-input"
      placeholder="Uitnodigingscode (bijv. INV7X2K)"
      value={authCode}
      onChange={e => {
        setAuthCode(e.target.value.toUpperCase());
        setAuthError("");
      }}
      style={{ fontFamily: "Space Mono, monospace", letterSpacing: 2 }}
    />

    <button className="auth-btn auth-btn-blue" onClick={joinBus}>
      Deelnemen
    </button>

    <button
      className="auth-btn auth-btn-secondary"
      onClick={() => setAuthScreen("welcome")}
    >
      Terug
    </button>

    <div className="auth-sub">
      Vraag de uitnodigingscode aan je monteur
    </div>
  </>
)}

{authScreen === "relogin" && (
  <>
    <div className="auth-title">Opnieuw inloggen</div>

    {authError && <div className="auth-error">{authError}</div>}

    <input
      className="auth-input"
      placeholder="Buscode"
      value={reloginBusCode}
      onChange={e => {
        setReloginBusCode(e.target.value.toUpperCase());
        setAuthError("");
      }}
      style={{ fontFamily: "Space Mono, monospace", letterSpacing: 2 }}
    />

    <input
      className="auth-input"
      type="password"
      placeholder="Wachtwoord"
      value={reloginPassword}
      onChange={e => {
        setReloginPassword(e.target.value);
        setAuthError("");
      }}
    />

    <button className="auth-btn auth-btn-primary" onClick={reloginExistingBus}>
      Inloggen
    </button>

    <button
      className="auth-btn auth-btn-secondary"
      onClick={() => {
        setAuthScreen("welcome");
        setReloginBusCode("");
        setReloginPassword("");
        setAuthError("");
      }}
    >
      Terug
    </button>

    <div className="auth-sub">
      Log opnieuw in met je buscode en wachtwoord
    </div>
  </>
)}

    </div></div></>
  );

  if (showSettings) return (
    <><style>{CSS}</style><div className="app">
      <div className="header"><div className="header-top"><div><button onClick={() => setShowSettings(false)} style={{background:'none',border:'none',color:'white',cursor:'pointer',padding:'4px 0',display:'flex',alignItems:'center',gap:4}}><IconBack/><span style={{fontSize:14}}>Terug</span></button><div style={{display:'flex',alignItems:'center',gap:'10px'}}><img src="/logo.png" alt="logo" style={{height:'28px',objectFit:'contain'}} /><div className="logo-text">Bonarius</div></div><div className="title">Instellingen</div></div><div/></div></div>
      <div style={{padding:16}}>
        <div className="settings-section"><div className="settings-label">Bus</div><div className="settings-value">{busInfo?.name}</div></div>
        <div className="settings-section">
  <div className="settings-label">Buscode</div>
  <div className="bus-code-display">
    {busInfo?.code}
  </div>
  <div style={{fontSize:12,color:'var(--text2)',textAlign:'center'}}>
    Interne buscode
  </div>
</div>

{session.role === "monteur" && (
  <div className="settings-section">
    <div className="settings-label">Eenmalige uitnodigingscode</div>

    {latestInviteCode ? (
      <div
        className="bus-code-display"
        onClick={() => {
          navigator.clipboard?.writeText(latestInviteCode);
          showToastMsg("Uitnodigingscode gekopieerd!");
        }}
      >
        {latestInviteCode}
      </div>
    ) : (
      <div style={{fontSize:13,color:'var(--text2)',marginBottom:12}}>
        Maak een code voor een hulpmonteur. Deze code is straks maar 1 keer bruikbaar.
      </div>
    )}

    <button
      className="auth-btn auth-btn-primary"
      onClick={createInviteCode}
      style={{marginTop:8}}
    >
      Nieuwe uitnodigingscode maken
    </button>
  </div>
)}

{session.role === "monteur" && (
  <div className="settings-section">
    <div className="settings-label">Wachtwoord wijzigen</div>

    <input
      className="auth-input"
      type="password"
      placeholder="Nieuw wachtwoord"
      value={newPassword}
      onChange={e => setNewPassword(e.target.value)}
      style={{ marginBottom: 10 }}
    />

    <input
      className="auth-input"
      type="password"
      placeholder="Herhaal nieuw wachtwoord"
      value={confirmNewPassword}
      onChange={e => setConfirmNewPassword(e.target.value)}
      style={{ marginBottom: 10 }}
    />

    <button
      className="auth-btn auth-btn-primary"
      onClick={changeBusPassword}
    >
      Wachtwoord wijzigen
    </button>
  </div>
)}

        <div className="settings-section"><div className="settings-label">Ingelogd als</div><div className="settings-value">{session.name} <span style={{color:'var(--accent)',fontSize:12,fontFamily:'Space Mono, monospace'}}>({session.role})</span></div></div>
        <div className="settings-section"><div className="settings-label">Teamleden ({busInfo?.members?.length})</div>{busInfo?.members?.map(m => (<div key={m.id} className="member-item"><div><div className="member-name">{m.name}</div><div className="member-role">{m.role}</div></div>{session.role === "monteur" && m.role === "hulpmonteur" && <button className="member-remove" onClick={() => removeMember(m.id)}>Verwijderen</button>}</div>))}</div>
        {isMainAdmin && (
  <div className="settings-section">
    <div className="settings-label">Toegestane monteurs voor nieuwe bussen</div>

    <input
      className="auth-input"
      placeholder="E-mailadres toevoegen"
      value={newCreatorEmail}
      onChange={e => setNewCreatorEmail(e.target.value)}
      style={{ marginBottom: 10 }}
    />

    <button
      className="auth-btn auth-btn-primary"
      onClick={addApprovedCreator}
    >
      Monteur toevoegen
    </button>

    <div style={{ marginTop: 12 }}>
      {approvedCreators.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          Nog geen toegestane monteurs toegevoegd
        </div>
      ) : (
        approvedCreators.map(row => (
          <div
  key={row.email}
  className="member-item"
  style={{ opacity: row.active ? 1 : 0.5 }}
>
            <div>
              <div className="member-name">{row.email}</div>
              <div className="member-role">
  {row.email === "m.slootemaker@bonarius.com"
    ? "hoofdadmin"
    : !row.active
    ? "inactief"
    : row.used_at
    ? "al gebruikt"
    : "toegestaan"}
</div>
            </div>

            {row.email !== "m.slootemaker@bonarius.com" && (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
    {row.active ? (
      <button
        className="member-remove"
        onClick={() => removeApprovedCreator(row.email)}
      >
        Deactiveren
      </button>
    ) : (
      <button
        className="member-activate"
        onClick={() => reactivateApprovedCreator(row.email)}
      >
        Activeren
      </button>
    )}

    <button
      className="member-remove"
      onClick={() => deleteApprovedCreatorForever(row.email)}
    >
      Definitief verwijderen
    </button>
  </div>
)}
          </div>
        ))
      )}
    </div>
  </div>
)}

{isMainAdmin && (
  <div className="settings-section">
    <div className="settings-label">Alle bussen en leden</div>

    {allBuses.length === 0 ? (
      <div style={{ fontSize: 13, color: "var(--text2)" }}>
        Geen bussen gevonden
      </div>
    ) : (
      allBuses.map(bus => {
        const membersForBus = allBusMembers.filter(m => m.bus_code === bus.code);

        return (
          <div
            key={bus.code}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              background: "var(--surface2)",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{bus.name}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text2)",
                  fontFamily: "Space Mono, monospace",
                }}
              >
                {bus.code} • eigenaar: {bus.owner_email}
              </div>
            </div>

            <button
  className="auth-btn auth-btn-secondary"
  onClick={() => setTemporaryPassword(bus.code)}
  style={{ marginBottom: 12 }}
>
  🔑 Tijdelijk wachtwoord maken
</button>

            {membersForBus.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text2)" }}>
                Geen leden in deze bus
              </div>
            ) : (
              membersForBus.map(member => (
                <div
                  key={`${member.bus_code}-${member.member_id}`}
                  className="member-item"
                  style={{ opacity: member.active === false ? 0.5 : 1 }}
                >
                  <div>
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">
                      {member.role} • {member.active === false ? "inactief" : "actief"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
  {member.member_id !== session.userId && (
    <>
      {member.active === false ? (
        <button
          className="member-activate"
          onClick={() => reactivateBusMember(member.member_id, member.bus_code)}
        >
          Activeren
        </button>
      ) : (
        <button
          className="member-remove"
          onClick={() => deactivateBusMember(member.member_id, member.bus_code)}
        >
          Deactiveren
        </button>
      )}

      <button
        className="member-remove"
        onClick={() => deleteBusMemberAdmin(member.member_id, member.bus_code)}
      >
        Verwijderen
      </button>
    </>
  )}
</div>
                </div>
              ))
            )}
          </div>
        );
      })
    )}
  </div>
)}

        <button
  className="auth-btn auth-btn-secondary"
  onClick={openLogoutConfirm}
  style={{ marginTop: 16 }}
>
  Uitloggen
</button>
      </div>

      {showLogoutConfirm && (
  <div className="cart-overlay" onClick={cancelLogout}>
    <div className="cart-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle" />

      <div className="cart-header">
        <div className="cart-title">Uitloggen bevestigen</div>
        <button className="cart-close" onClick={cancelLogout}>✕</button>
      </div>

      <div style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
        Weet je zeker dat je wilt uitloggen?
      </div>

      <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
        Noteer eerst je buscode goed. Deze heb je later nodig om opnieuw in te loggen.
      </div>

      <div className="bus-code-display" style={{ marginBottom: 16 }}>
        {busInfo?.code || session?.busCode || "-"}
      </div>

      <div className="modal-actions">
        <button className="btn-cancel" onClick={cancelLogout}>
          Annuleren
        </button>
        <button className="btn-add" onClick={confirmLogout}>
          Ja, uitloggen
        </button>
      </div>
    </div>
  </div>
)}

    </div>{toast && <div className="toast">{toast}</div>}</>
  );

  return (
    <><style>{CSS}</style><div className="app">
      <div className="header">
        <div className="header-top">
          <div>
            {view !== "home" && <button onClick={goBack} style={{background:'none',border:'none',color:'white',cursor:'pointer',padding:'4px 0',display:'flex',alignItems:'center',gap:4}}><IconBack/><span style={{fontSize:14}}>Terug</span></button>}
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}><img src="/logo.png" alt="logo" style={{height:'28px',objectFit:'contain'}} /><div className="logo-text">Bonarius</div></div>
            <div className="title">{view === "home" ? ("Voorraadbeheer " + (busInfo?.name || "")) : view === "linker" ? "Linker Stelling" : view === "rechter" ? "Rechter Stelling" : drawer}</div>
            <div className="user-badge">{session.name} • {session.role}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
            <button className="cart-btn" onClick={() => { refreshData(); setShowCart(true); }}><IconCart/> Lijst{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</button>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => setShowGlobalSearch(true)} style={{width:44,height:44,borderRadius:12,border:'none',background:'var(--surface2)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IconSearch/></button>
              <button onClick={() => { refreshData(); loadApprovedCreators(); loadAdminOverview(); setShowSettings(true); }} style={{width:44,height:44,borderRadius:12,border:'none',background:'var(--surface2)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IconGear/></button>
            </div>
          </div>
        </div>
        <div className="breadcrumb"><span onClick={goHome} className={view==="home"?"active":""}>Home</span>{(view==="linker"||view==="rechter"||view==="drawer")&&<><span className="sep">›</span><span onClick={() => goSide(side)} className={view!=="drawer"?"active":""}>{side==="linker"?"Linker Stelling":"Rechter Stelling"}</span></>}{view==="drawer"&&<><span className="sep">›</span><span className="active">{drawer}</span></>}</div>
      </div>

      {view === "home" && <div className="van-view"><div className="van-svg-container"><VanSVG onClickLeft={() => goSide("linker")} onClickRight={() => goSide("rechter")} /></div><div className="side-cards"><div className="side-card" onClick={() => goSide("linker")}><div className="icon">🔧</div><div className="label">Linker Stelling</div><div className="sub">12 laden • Pers & Gas</div></div><div className="side-card" onClick={() => goSide("rechter")}><div className="icon">⚙️</div><div className="label">Rechter Stelling</div><div className="sub">7 laden • Knel & Las</div></div></div></div>}

      {(view === "linker" || view === "rechter") && <div className="drawer-list"><ShelfView side={side} data={data} onOpenDrawer={goDrawer} /></div>}

      {view === "drawer" && <div className="article-list">
        {isInfoDrawer ? <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text2)'}}><div style={{fontSize:48,marginBottom:16}}>{drawerData._info.split(' ')[0]}</div><div style={{fontSize:16,fontWeight:500,color:'var(--text)'}}>{drawerData._info.substring(drawerData._info.indexOf(' ')+1)}</div><div style={{fontSize:13,marginTop:8}}>Geen bestelbare artikelen</div></div> : <>
        <div className="search-bar"><span className="search-icon"><IconSearch/></span><input placeholder="Zoek artikel of code..." value={search} onChange={e => setSearch(e.target.value)} />{search && <button onClick={() => setSearch("")} style={{background:'none',border:'none',color:'var(--text2)',fontSize:18,cursor:'pointer'}}>✕</button>}</div>
        {filteredItems.length === 0 && <div style={{textAlign:'center',color:'var(--text2)',padding:40}}>Geen artikelen gevonden</div>}
        {filteredItems.map((item, i) => <div key={i} className="article-item" onClick={() => { setModal(item); setQty(item.qty); }}><img src={item.img} alt="" loading="lazy" /><div className="article-info"><div className="article-name">{item.name}</div><div className="article-code">{item.code}</div></div><div className="article-qty-badge">std: {item.qty}</div><div className="add-icon">+</div></div>)}
        </>}
      </div>}

      {modal && <div className="modal-overlay" onClick={() => setModal(null)}><div className="modal-sheet" onClick={e => e.stopPropagation()}><div className="modal-handle"/><div className="modal-title">{modal.name}</div><div className="modal-sub">Code: {modal.code} • Standaard: {modal.qty}</div><div className="qty-controls"><button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button><div className="qty-display">{qty}</div><button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button></div><div className="modal-actions"><button className="btn-cancel" onClick={() => setModal(null)}>Annuleren</button><button className="btn-add" onClick={() => addToCart(modal, qty)}>Toevoegen</button></div></div></div>}

      {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}><div className="cart-sheet" onClick={e => e.stopPropagation()}><div className="modal-handle"/><div className="cart-header"><div className="cart-title">Bestellijst ({cartCount})</div><button className="cart-close" onClick={() => setShowCart(false)}>✕</button></div><div className="cart-items">{cart.length === 0 && <div className="cart-empty">De bestellijst is leeg</div>}{cart.map(c => <div key={c.key} className="cart-item"><div className="cart-item-qty">{c.quantity}×</div><div className="cart-item-info"><div className="cart-item-name">{c.name}</div><div className="cart-item-code">{c.code}</div>{c.addedBy && <div className="cart-item-by">Toegevoegd door {c.addedBy}</div>}</div><button className="cart-item-del" onClick={() => removeFromCart(c.key)}>✕</button></div>)}</div><div className="cart-actions">{cart.length > 0 && <><button className="btn-email" onClick={sendEmail}>📧 Verzenden naar Mail</button><button className="btn-clear" onClick={clearCartAll}>Lijst leegmaken</button></>}</div></div></div>}

      {showGlobalSearch && <div className="cart-overlay" onClick={() => setShowGlobalSearch(false)}><div className="cart-sheet" onClick={e => e.stopPropagation()}><div className="modal-handle"/><div className="cart-header"><div className="cart-title">Zoek in alle lades</div><button className="cart-close" onClick={() => setShowGlobalSearch(false)}>✕</button></div><div className="search-bar" style={{marginBottom:16}}><span className="search-icon"><IconSearch/></span><input placeholder="Zoek artikel of code..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} autoFocus />{globalSearch && <button onClick={() => setGlobalSearch("")} style={{background:'none',border:'none',color:'var(--text2)',fontSize:18,cursor:'pointer'}}>✕</button>}</div><div className="cart-items">{!globalSearch && <div className="cart-empty">Typ een artikelnaam of code</div>}{globalSearch && filteredGlobalItems.length === 0 && <div className="cart-empty">Geen artikelen gevonden</div>}{filteredGlobalItems.map((item, i) => <div key={`${item.side}-${item.drawer}-${item.code}-${i}`} className="article-item" onClick={() => { setSide(item.side); setDrawer(item.drawer); setView("drawer"); setShowGlobalSearch(false); setSearch(""); setModal(item); setQty(item.qty); }}><img src={item.img} alt="" loading="lazy" /><div className="article-info"><div className="article-name">{item.name}</div><div className="article-code">{item.code} • {item.side === "linker" ? "Links" : "Rechts"} • {item.drawer}</div></div><div className="article-qty-badge">std: {item.qty}</div></div>)}</div></div></div>}

      {toast && <div className="toast">{toast}</div>}
    </div></>
  );
}
