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
    { name: "Perssok Viega Prestabo 22x22mm", code: "0556002", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/99/11855199.jpg" },
    { name: "Perssok Viega Prestabo 28x28mm", code: "0556003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/00/11855200.jpg" },
    { name: "Perssok Viega Prestabo 35x35mm", code: "0556004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/01/11855201.jpg" },
    { name: "Bochtkoppeling 90° PRESTABO 15x15mm", code: "0556201", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/21/11855321.jpg" },
    { name: "Bochtkoppeling 90° PRESTABO 22x22mm", code: "0556202", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/06/18704506.jpg" },
    { name: "Bochtkoppeling 90° PRESTABO 28x28mm", code: "0556203", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/23/11855323.jpg" },
    { name: "Bochtkoppeling 90° PRESTABO 35x35mm", code: "0556204", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/24/11855324.jpg" },
    { name: "Bochtkoppeling 45° PRESTABO 15x15mm", code: "0556281", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/65/11855365.jpg" },
    { name: "Bochtkoppeling 45° PRESTABO 22x22mm", code: "0556282", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/66/11855366.jpg" },
    { name: "Bochtkoppeling 45° PRESTABO 28x28mm", code: "0556283", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/67/11855367.jpg" },
    { name: "Bochtkoppeling 45° PRESTABO 35x35mm", code: "0556284", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/68/11855368.jpg" },
    { name: "Insteekbocht 45° PRESTABO 22x spie 22mm", code: "0556302", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/77/11855377.jpg" },
    { name: "Insteekbocht 45° PRESTABO 28x spie 28mm", code: "0556303", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/78/11855378.jpg" },
    { name: "Insteekbocht 45° PRESTABO 35x spie 35mm", code: "0556304", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/53/79/11855379.jpg" },
    { name: "T-koppeling PRESTABO 15x15x15mm", code: "0556364", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/09/11855409.jpg" },
    { name: "T-koppeling PRESTABO 22x22x22mm", code: "0556374", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/21/11855421.jpg" },
    { name: "T-koppeling PRESTABO 28x28x28mm", code: "0556381", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/30/11855430.jpg" },
    { name: "T-koppeling PRESTABO 35x35x35mm", code: "0556387", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/54/38/11855438.jpg" },
    { name: "T-koppeling verlop. PRESTABO 22x½bn x22mm", code: "0556452", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/25/11855525.jpg" },
    { name: "T-koppeling verlop. PRESTABO 28x½bn x28mm", code: "0556454", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/30/11855530.jpg" },
    { name: "T-koppeling verlop. PRESTABO 35x½bn x35mm", code: "0556456", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/32/11855532.jpg" },
    { name: "Puntstuk PRESTABO 15x½ bt.", code: "0556023", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/12/11855212.jpg" },
    { name: "Puntstuk PRESTABO 22x¾ bt.", code: "0556024", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/13/11855213.jpg" },
    { name: "Puntstuk PRESTABO 28x1 bt.", code: "0556025", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/14/11855214.jpg" },
    { name: "Puntstuk PRESTABO 35x1¼ bt.", code: "0556027", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/16/11855216.jpg" },
    { name: "Schroefbus recht PRESTABO 22x½ bn.", code: "0556067", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/48/11855248.jpg" },
    { name: "Schroefbus recht PRESTABO 28x¾ bn.", code: "0556070", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/51/11855251.jpg" },
    { name: "Schroefbus recht PRESTABO 28x1 bn.", code: "0556071", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/52/11855252.jpg" },
    { name: "Schroefbus recht PRESTABO 35x1¼ bn.", code: "0556073", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/54/11855254.jpg" },
    { name: "Insteekverloopsok PRESTABO 15x spie 22mm", code: "0556124", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/83/11855283.jpg" },
    { name: "Insteekverloopsok PRESTABO 22x spie 28mm", code: "0556126", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/85/11855285.jpg" },
    { name: "Insteekverloopsok PRESTABO 28x spie 35mm", code: "0556129", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/88/11855288.jpg" },
  ],
  "Lade 2": [
    { name: "Insteekverloopsok PRESTABO 35x spie 42mm", code: "0556132", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/91/11855291.jpg" },
    { name: "Perssok Profipress koper 15x15mm", code: "0565001", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/24/11858624.jpg" },
    { name: "Perssok Profipress koper 22x22mm", code: "0565003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/26/11858626.jpg" },
    { name: "Perssok Profipress koper 28x28mm", code: "0565004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/27/11858627.jpg" },
    { name: "Perssok Profipress koper 35x35mm", code: "0565005", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/28/11858628.jpg" },
    { name: "Perssok Profipress koper 42x42mm", code: "0565006", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/29/11858629.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 15mm", code: "0565282", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/41/18703841.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 22mm", code: "0565283", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/65/11858765.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 28mm", code: "0565284", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/66/11858766.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 35mm", code: "0565285", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/67/11858767.jpg" },
    { name: "Bochtkoppeling 90° Profipress koper 42mm", code: "0565286", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/68/11858768.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 22mm", code: "0565363", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/05/11858805.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 28mm", code: "0565364", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/06/11858806.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 35mm", code: "0565365", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/07/11858807.jpg" },
    { name: "Bochtkoppeling 45° Profipress koper 42mm", code: "0565366", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/08/11858808.jpg" },
    { name: "T-koppeling Profipress koper 15x15x15mm", code: "0565472", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/58/11858858.jpg" },
    { name: "T-koppeling Profipress koper 22x22x22mm", code: "0565485", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/58/11858858.jpg" },
    { name: "T-koppeling Profipress koper 28x28x28mm", code: "0565497", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/83/11858883.jpg" },
  ],
  "Lade 3": [
    { name: "T-koppeling Profipress koper 35x35x35mm", code: "0565506", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/88/91/11858891.jpg" },
    { name: "T-koppeling Profipress koper 42x42x42mm", code: "0565515", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/89/00/11858900.jpg" },
    { name: "Insteekverloopsok Profipress 15x12mm", code: "0565070", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/63/11858663.jpg" },
    { name: "Insteekverloopsok Profipress 22x15mm", code: "0565073", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/66/11858666.jpg" },
    { name: "Insteekverloopsok Profipress 28x22mm", code: "0565077", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/70/11858670.jpg" },
    { name: "Insteekverloopsok Profipress 35x28mm", code: "0565079", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/72/11858672.jpg" },
    { name: "Insteekverloopsok Profipress 42x35mm", code: "0565082", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/75/11858675.jpg" },
    { name: "Perssok verlopend Profipress 15x12mm", code: "0565020", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/35/11858635.jpg" },
    { name: "Perssok verlopend Profipress 22x15mm", code: "0565022", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/37/11858637.jpg" },
    { name: "Perssok verlopend Profipress 28x22mm", code: "0565024", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/39/11858639.jpg" },
    { name: "Perssok verlopend Profipress 35x28mm", code: "0565025", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/40/11858640.jpg" },
    { name: "Perssok verlopend Profipress 42x35mm", code: "0565026", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/41/11858641.jpg" },
    { name: "Puntstuk Sanpress brons 15x½ bt.", code: "0565193", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/31/11858731.jpg" },
    { name: "Puntstuk Sanpress brons 22x¾ bt.", code: "0565198", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/36/11858736.jpg" },
    { name: "Puntstuk Sanpress brons 22x1 bt.", code: "0565199", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/37/11858737.jpg" },
    { name: "Puntstuk Sanpress brons 28x¾ bt.", code: "0565200", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/38/11858738.jpg" },
    { name: "Puntstuk Sanpress brons 28x1 bt.", code: "0565201", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/39/11858739.jpg" },
    { name: "Puntstuk Sanpress brons 35x1 bt.", code: "0565203", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/41/11858741.jpg" },
    { name: "Puntstuk Sanpress brons 35x1¼ bt.", code: "0565204", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/42/11858742.jpg" },
    { name: "Schroefbus recht Sanpress 15x½ bn.", code: "0565113", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/92/11858692.jpg" },
    { name: "Schroefbus recht Sanpress 22x½ bn.", code: "0565117", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/96/11858696.jpg" },
    { name: "Schroefbus recht Sanpress 22x¾ bn.", code: "0565118", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/86/97/11858697.jpg" },
    { name: "Schroefbus recht Sanpress 28x¾ bn.", code: "0565121", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/00/11858700.jpg" },
    { name: "Schroefbus recht Sanpress 28x1 bn.", code: "0565122", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/01/11858701.jpg" },
    { name: "Schroefbus recht Sanpress 35x1 bn.", code: "0565125", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/04/11858704.jpg" },
    { name: "Schroefbus recht Sanpress 35x1¼ bn.", code: "0565126", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/87/05/11858705.jpg" },
  ],
  "Lade 4": [
    { name: "Perssok Profipress Gas 15x15mm", code: "0566001", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/34/11859234.jpg" },
    { name: "Perssok Profipress Gas 22x22mm", code: "0566003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/36/11859236.jpg" },
    { name: "Perssok Profipress Gas 28x28mm", code: "0566004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/37/11859237.jpg" },
    { name: "Perssok Profipress Gas 35x35mm", code: "0566005", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/38/11859238.jpg" },
    { name: "Perssok Profipress Gas 42x42mm", code: "0566006", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/39/11859239.jpg" },
    { name: "Bochtkoppeling 90° Gas 15x15mm", code: "0566121", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/98/11859298.jpg" },
    { name: "Bochtkoppeling 90° Gas 22x22mm", code: "0566123", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/00/11859300.jpg" },
    { name: "Bochtkoppeling 90° Gas 28x28mm", code: "0566124", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/01/11859301.jpg" },
    { name: "Bochtkoppeling 90° Gas 35x35mm", code: "0566125", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/02/11859302.jpg" },
    { name: "Bochtkoppeling 90° Gas 42x42mm", code: "0566126", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/03/11859303.jpg" },
    { name: "T-koppeling Gas 15x15x15mm", code: "0566242", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/54/11859354.jpg" },
    { name: "T-koppeling Gas 22x22x22mm", code: "0566248", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/60/11859360.jpg" },
    { name: "T-koppeling Gas 28x28x28mm", code: "0566255", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/67/11859367.jpg" },
    { name: "T-koppeling Gas 35x35x35mm", code: "0566259", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/71/11859371.jpg" },
    { name: "T-koppeling Gas 42x42x42mm", code: "0566262", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/74/11859374.jpg" },
  ],
  "Lade 5": [
    { name: "Insteekverloopsok Gas 15x12mm", code: "0566040", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/48/11859248.jpg" },
    { name: "Insteekverloopsok Gas 22x15mm", code: "0566042", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/50/11859250.jpg" },
    { name: "Insteekverloopsok Gas 28x22mm", code: "0566046", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/54/11859254.jpg" },
    { name: "Insteekverloopsok Gas 35x28mm", code: "0566048", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/56/11859256.jpg" },
    { name: "Insteekverloopsok Gas 42x35mm", code: "0566051", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/59/11859259.jpg" },
    { name: "Puntstuk Gas brons 15x½ bt.", code: "0566092", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/79/11859279.jpg" },
    { name: "Puntstuk Gas brons 22x¾ bt.", code: "0566097", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/84/11859284.jpg" },
    { name: "Puntstuk Gas brons 28x1 bt.", code: "0566100", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/87/11859287.jpg" },
    { name: "Knelring Super Blue 22mm ⅜ dikw.", code: "0558395", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/45/26256345.jpg" },
    { name: "Knelring Super Blue 22mm ½ dikw.", code: "0557820", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/45/26256345.jpg" },
    { name: "Knelring Super Blue 28mm ¾ dikw.", code: "0557822", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/45/26256345.jpg" },
    { name: "Perssok Henco 16x16mm kunststof", code: "9234314", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/28/98/46812898.jpg" },
    { name: "Perssok Henco 20x20mm kunststof", code: "9234315", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/28/98/46812898.jpg" },
    { name: "Kniekoppeling 90° Henco 16x16mm", code: "9234407", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/29/36/46812936.jpg" },
    { name: "Kniekoppeling 90° Henco 20x20mm", code: "9234408", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/29/36/46812936.jpg" },
    { name: "T-koppeling Henco 16x16x16mm", code: "9234555", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/42/46813042.jpg" },
    { name: "T-koppeling Henco 20x20x20mm", code: "9234556", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/42/46813042.jpg" },
  ],
  "Lade 6": [
    { name: "Aftapper messing blauw ¼ bt. Raminex", code: "0534595", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/78/63/11847863.jpg" },
    { name: "Aftapper messing rood ¼ bt. Raminex", code: "0534594", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/03/89/27050389.jpg" },
    { name: "Ontluchtingssleutel metaal", code: "0FK5976", qty: 20, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/36/74/35893674.jpg" },
    { name: "Verloopset 15mm-14x2,0mm PenTec", code: "0540761", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/29/105769029.jpg" },
    { name: "Knelringset vernikkeld 15mm-16x2,0mm PenTec", code: "0545995", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/39/105769039.jpg" },
    { name: "Knelringset vernikkeld 22mm-20x2,0mm PenTec", code: "0545969", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/42/105769042.jpg" },
    { name: "Knelringset vernikkeld M22-16x2,0mm PenTec", code: "0545968", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/28/105769028.jpg" },
    { name: "Kraanverlengstuk verchr. ½x10mm", code: "0730153", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchr. ½x20mm", code: "0730155", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchr. ½x30mm", code: "0730157", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchr. ½x40mm", code: "0730158", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Kraanverlengstuk verchr. ½x50mm", code: "0730159", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/69/52/11766952.jpg" },
    { name: "Wasmachinekraan ½bt. m. keerklep", code: "0720588", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/02/11863802.jpg" },
    { name: "Veiligheidsventiel Prescor ½ 3bar Flamco", code: "0534027", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/75/21/11847521.jpg" },
    { name: "Veiligheidsventiel Prescor ¾ 3bar Flamco", code: "0534030", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/96/08/120439608.jpg" },
    { name: "Veiligheidsvnt. boiler Prescor B ½ 8bar", code: "0254005", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/95/23/120439523.jpg" },
    { name: "Veiligheidsvnt. boiler Prescor B ¾x1 8bar", code: "0254006", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/95/27/120439527.jpg" },
    { name: "Gaskogelkraan knel 15x15mm VSH", code: "0730036", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/38/133323038.jpg" },
    { name: "Gaskogelkraan 15x½ bt. VSH", code: "0730055", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/43/133323043.jpg" },
    { name: "Gaskogelkraan 22x¾ bt. VSH", code: "0730057", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/30/43/133323043.jpg" },
    { name: "Vacuumklep N36 15 ½ Watts", code: "0FP2049", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/01/16/132510116.jpg" },
    { name: "Auto. ontluchter Minical ⅜ Caleffi", code: "0533800", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/28/12/133772812.jpg" },
    { name: "Auto. ontluchter Flexvent ½bt. 10bar Flamco", code: "0534009", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/77/63/120437763.jpg" },
    { name: "Thermometer alu. 63mm 0-120°C ½bt. axiaal", code: "0522415", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/96/11839096.jpg" },
    { name: "Staafthermometer haaks 0-120°C ½bt", code: "0522420", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/98/11839098.jpg" },
    { name: "Manometer 63mm ¼ axiaal 0-4bar Flamco", code: "0522000", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/07/25655507.jpg" },
    { name: "Manometer 0-4bar 63mm ¼ radiaal Flamco", code: "0AP3209", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/06/38/11880638.jpg" },
    { name: "Kogelkraan Ballofix chroom knel 15mm", code: "0534544", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/56/133334956.jpg" },
    { name: "Minikogelkraan Ballofix schroevend. FM G½", code: "0534531", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/65/133334965.jpg" },
    { name: "Stekkerplug tbv Alpha pomp Grundfos", code: "0502223", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/31/60/46823160.jpg" },
    { name: "Slangklem 12-22mm", code: "0508266", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/69/11833869.jpg" },
    { name: "Slangklem 16-27mm", code: "0508269", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/38/72/11833872.jpg" },
    { name: "Auto. ontluchter Spirotop ½bn. Spirotech", code: "0535098", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/82/28/11848228.jpg" },
    { name: "Terugslagklep CIM30 vernikkeld 1bn. Cimberio", code: "0534600", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/78/67/11847867.jpg" },
    { name: "Inlaatcombinatie Q-lite BIC 15x15mm VSH", code: "0254021", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/24/44/11802444.jpg" },
    { name: "Inlaatcombinatie DUCO UBIC 22mm PenTec", code: "0254009", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/01/116206301.jpg" },
    { name: "Kolmat Fibre Seal 14mm 15m Griffon", code: "0585066", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/04/88/11860488.jpg" },
    { name: "Kroon kopervet Copper Plus 100gr", code: "8503698", qty: 2, img: "https://imagescdn.wasco.nl/5/001/825/349/8503698_Z9953159_Kroon_Hoofdafbeelding_01.jpg" },
    { name: "Soldeerkwastje kunststof haar Griffon", code: "0586005", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/13/29741313.jpg" },
  ],
  "Lade 7": { _info: "🔩 Allerlei boren" },
  "Lade 8": [
    { name: "Klemset ½x15mm HERZ", code: "0530160", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/11846428.jpg" },
    { name: "Klemset staal/CU ½x15mm Danfoss", code: "0530402", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/60/56805860.jpg" },
    { name: "Klemset ½x15mm IMI Heimeier", code: "0531121", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/97/64/50039764.jpg" },
    { name: "RA afsluiter handbed. recht ⅜ HERZ", code: "0530001", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/21/20/18632120.jpg" },
    { name: "RA afsluiter handbed. haaks ⅜ HERZ", code: "0530006", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/21/30/18632130.jpg" },
    { name: "RA afsluiter handbed. recht ½ HERZ", code: "0530002", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/26/11846326.jpg" },
    { name: "RA afsluiter handbed. haaks ½ HERZ", code: "0530007", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/34/11846334.jpg" },
    { name: "RA afsluiter handbed. recht ¾ HERZ", code: "0530003", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/28/11846328.jpg" },
    { name: "RA afsluiter handbed. haaks ¾ HERZ", code: "0530008", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/36/11846336.jpg" },
    { name: "RA afsluiter therm. TS-98-V recht ½ HERZ", code: "0529991", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/16/11846316.jpg" },
    { name: "RA afsluiter therm. TS-98-V haaks ½ HERZ", code: "0529993", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/21/76/18632176.jpg" },
    { name: "Radiatorbocht ½ conisch chroom HERZ", code: "0530046", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/74/11846374.jpg" },
    { name: "RA aansluitbocht 90° ½ Danfoss", code: "0530436", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/93/99/123039399.jpg" },
    { name: "Bocht brons vern. Duolux DN15 Heimeier", code: "0531301", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/68/49/11846849.jpg" },
    { name: "Staartstuk ½x76 verlengd HERZ", code: "0530052", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/18/48/18631848.jpg" },
    { name: "Voetventiel RL-1 recht ½ HERZ", code: "0532084", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/15/12/18631512.jpg" },
    { name: "Voetventiel RL-1 haaks ½ HERZ", code: "0532088", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/15/18/18631518.jpg" },
    { name: "Thermostaatkop zonder 0-stand wit", code: "0530080", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/90/11846390.jpg" },
    { name: "Thermostaatknop AVEO-RA Danfoss", code: "0GJ1475", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/55/52/56805552.jpg" },
    { name: "Thermostaatkop K wit 0-stand IMI Heimeier", code: "0531424", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/01/67/50040167.jpg" },
    { name: "Handbedieningsknop Design HERZ", code: "0530076", qty: 2, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/88/11846388.jpg" },
    { name: "Perssok MaxiPro ¼x¼ Banninger", code: "0EX9228", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/56/11902756.jpg" },
    { name: "Perssok MaxiPro ⅜x⅜ Banninger", code: "0EX9229", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/57/11902757.jpg" },
    { name: "Perssok MaxiPro ½x½ Banninger", code: "0EX9230", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/02/11779202.jpg" },
    { name: "Perssok MaxiPro ⅝x⅝ Banninger", code: "0EX9231", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/58/11902758.jpg" },
    { name: "Bochtkoppeling MaxiPro 90° ¼ Banninger", code: "0EX9184", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/17/11902717.jpg" },
    { name: "Bochtkoppeling MaxiPro 90° ⅜ Banninger", code: "0EX9185", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/18/11902718.jpg" },
    { name: "Bochtkoppeling MaxiPro 90° ½ Banninger", code: "0EX9186", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/19/11902719.jpg" },
    { name: "Bochtkoppeling MaxiPro 90° ⅝ Banninger", code: "0EX9187", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/91/98/11779198.jpg" },
    { name: "Flare koppeling MaxiPro ¼ Banninger", code: "0EX9252", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/92/05/11779205.jpg" },
    { name: "Flare koppeling MaxiPro ⅜ Banninger", code: "0EX9253", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/71/11902771.jpg" },
    { name: "Flare koppeling MaxiPro ½ Banninger", code: "0EX9254", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/71/11902771.jpg" },
    { name: "Flare koppeling MaxiPro ⅝ Banninger", code: "0EX9255", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/27/72/11902772.jpg" },
    { name: "GARD Waterstop 13-15mm", code: "4330790", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4330790.gif" },
    { name: "GARD Kraanstuk 21mm (G½)", code: "4445046", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4445046.gif" },
    { name: "GARD Kraanstuk 26,5mm (G¾)", code: "4445053", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4445053.gif" },
    { name: "GARD Kraanstuk 33,3mm (G1)", code: "4445074", qty: 4, img: "https://www.technischeunie.nl/images/artikel/4445074.gif" },
  ],
  "Lade 9": [
    { name: "Zeskantbout+moer M16x120mm", code: "4860628", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout+moer M16x110mm", code: "4860627", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout+moer M16x90mm", code: "4860625", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout+moer M16x60 verzinkt", code: "0503050", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout+moer M12x80mm", code: "0536430", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Zeskantbout+moer M12x60mm", code: "4860592", qty: 8, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/52/45/18635245.jpg" },
    { name: "Grondplaat GP8 80x30mm", code: "0560906", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/36/16/12063616.jpg" },
    { name: "Grondplaat GP½ 80x30mm", code: "0560907", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/22/11857322.jpg" },
    { name: "Kogelscharnier KS M8x8 bt.xbn", code: "0560517", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/33/74/12063374.jpg" },
    { name: "Kogelscharnier Clickeasy K M8x8 FastFix", code: "0563442", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/79/80/11857980.jpg" },
    { name: "Schuifmoer Rapidrail WM0-35 M8 Walraven", code: "0561430", qty: 20, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/71/69/90107169.jpg" },
    { name: "Schuifmoer Clickeasy M8 FastFix", code: "0563424", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/39/05/12063905.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK Ø15mm", code: "0FT2558", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK Ø22mm", code: "0FT2560", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK Ø28mm", code: "0FT2561", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Pijpbeugel FLAMCOFIX BMK Ø35mm", code: "0FT2562", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/41/54/126954154.jpg" },
    { name: "Muurbeugel BM M8x15mm", code: "0561073", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/97/11857397.jpg" },
    { name: "Muurbeugel BM M8x½-22 HK", code: "0561003", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/91/11857391.jpg" },
    { name: "Muurbeugel BM M8x28mm", code: "0561075", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/98/11857398.jpg" },
    { name: "Muurbeugel BM M8x35mm", code: "0561076", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/99/11857399.jpg" },
    { name: "Profielklem KCK M8 verzinkt FastFix", code: "0563262", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/36/69/12063669.jpg" },
    { name: "Kopflens KF-H tbv Rail FastFix", code: "0560967", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/37/10/12063710.jpg" },
    { name: "Railverbinder ClickConnection 90° FastFix", code: "0563472", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/94/80/130519480.jpg" },
  ],
  "Lade 10": { _info: "🔧 Gereedschappen & producten" },
  "Lade 11": { _info: "🔵 PVC fittingen & pijpbeugels" },
  "Lade 12": { _info: "🪝 Hijsmiddelen" },
};

const RECHTER_LADEN = {
  "Lade 1": [
    { name: "Knelring messing 12mm", code: "0557831", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Knelring messing 15mm", code: "0557832", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Knelring messing 22mm", code: "0557833", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Knelring messing 28mm", code: "0557834", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/28/26256428.jpg" },
    { name: "Ontluchter vernikkeld ½\"", code: "0533234", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/73/93/11847393.jpg" },
    { name: "Aftapper draaibaar ⅜\" vernikkeld", code: "0533031", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/72/39/11847239.jpg" },
    { name: "Aftapper draaibaar ½\" vernikkeld", code: "0533030", qty: 10, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/72/39/11847239.jpg" },
    { name: "Knelsok 15x15mm vernikkeld", code: "0546004", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/54/26256354.jpg" },
    { name: "Kniekoppeling knel 15x15mm vernikkeld", code: "0546116", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/67/26256367.jpg" },
    { name: "Puntstuk knel 15x½ bt vernikkeld", code: "0546050", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/59/26256359.jpg" },
    { name: "Schroefbus recht knel 15x½ bn vernikkeld", code: "0546075", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/05/26256405.jpg" },
    { name: "T-koppeling vernikkeld knel 15x15x15mm", code: "0546213", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/07/26256407.jpg" },
    { name: "Knelsok 22x22mm vernikkeld", code: "0546006", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/54/26256354.jpg" },
    { name: "Kniekoppeling knel 22x22mm vernikkeld", code: "0546118", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/67/26256367.jpg" },
    { name: "Puntstuk knel 22x¾ bt vernikkeld", code: "0546052", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/59/26256359.jpg" },
    { name: "T-koppeling vernikkeld knel 22x22x22mm", code: "0546215", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/07/26256407.jpg" },
  ],
  "Lade 2": [
    { name: "Eindkoppeling knel 12mm", code: "0557061", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Eindkoppeling knel 15mm", code: "0557062", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Eindkoppeling knel 22mm", code: "0557063", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Eindkoppeling knel 28mm", code: "0557064", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/24/26235124.jpg" },
    { name: "Verloopset 18x15mm", code: "0DY3448", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/30/26256430.jpg" },
    { name: "Verloopset 22x15mm", code: "0557868", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/30/26256430.jpg" },
    { name: "Verloopset 28x22mm", code: "0557871", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/30/26256430.jpg" },
    { name: "Afsluitplaatje knel 15mm", code: "0557712", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/83/26256383.jpg" },
    { name: "Afsluitplaatje knel 22mm", code: "0557713", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/63/83/26256383.jpg" },
    { name: "Verloopring messing ½x⅛", code: "0730223", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/70/87/18707087.jpg" },
    { name: "Verloopring messing ½x¼", code: "0702225", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/94/25671394.jpg" },
    { name: "Verloopring messing ¾x½", code: "0702230", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/14/28/25671428.jpg" },
    { name: "Plug messing ½ bt", code: "0702083", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/14/20/25671420.jpg" },
    { name: "Plug messing ¾ bt", code: "0702084", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/92/25671392.jpg" },
    { name: "Dubbele nippel messing ½ bt", code: "0530177", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/14/00/25671400.jpg" },
    { name: "Dubbele nippel messing ¾ bt", code: "0530178", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/13/88/25671388.jpg" },
    { name: "Steunhuls koper 15x1,0mm", code: "0557891", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/36/26256436.jpg" },
    { name: "Steunhuls koper 22x1,0mm", code: "0557893", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/64/36/26256436.jpg" },
  ],
  "Lade 3": [
    { name: "Knelsok 15x15mm", code: "0557002", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/19/26235119.jpg" },
    { name: "Kniekoppeling knel 15x15mm", code: "0557102", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/65/11855765.jpg" },
    { name: "Puntstuk Super knel 15x½ bt", code: "0557023", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/26/26235126.jpg" },
    { name: "Schroefbus recht knel 15x½ bn", code: "0557052", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/30/26235130.jpg" },
    { name: "T-koppeling knel 15x15x15mm", code: "0557202", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/15/11855815.jpg" },
    { name: "Knelsok 22x22mm", code: "0557003", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/19/26235119.jpg" },
    { name: "Kniekoppeling knel 22x22mm", code: "0557103", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/66/11855766.jpg" },
    { name: "Puntstuk Super knel 22x½ bt", code: "0557025", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/26/26235126.jpg" },
    { name: "Puntstuk knel 22x¾ bt", code: "0557026", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/26/26235126.jpg" },
    { name: "Schroefbus recht knel 22x¾ bn", code: "0557056", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/30/26235130.jpg" },
    { name: "T-koppeling knel 22x22x22mm", code: "0557203", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/90/31/26959031.jpg" },
    { name: "Knelsok 28x28mm", code: "0557004", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/51/19/26235119.jpg" },
    { name: "Kniekoppeling knel 28x28mm", code: "0557104", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/57/67/11855767.jpg" },
    { name: "Muurplaat knel 15x½ bn", code: "0557403", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/58/68/11855868.jpg" },
  ],
  "Lade 4": [
    { name: "Sok malleabel zwart ½ bn", code: "0551103", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/76/11854476.jpg" },
    { name: "Sok malleabel zwart ¾ bn", code: "0551104", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/77/11854477.jpg" },
    { name: "Sok malleabel zwart 1 bn", code: "0551105", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/78/11854478.jpg" },
    { name: "Knie malleabel zwart ½ bn", code: "0550103", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/26/11854226.jpg" },
    { name: "Knie malleabel zwart ¾ bn", code: "0550104", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/27/11854227.jpg" },
    { name: "Knie malleabel zwart 1 bn", code: "0550105", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/28/11854228.jpg" },
    { name: "Dubbele nippel malleabel zwart ½ bt", code: "0551153", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/93/11854493.jpg" },
    { name: "Dubbele nippel malleabel zwart ¾ bt", code: "0551154", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/94/11854494.jpg" },
    { name: "Stop met rand malleabel zwart ½ bt", code: "0551183", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/04/11854504.jpg" },
    { name: "Stop met rand malleabel zwart ¾ bt", code: "0551184", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/05/11854505.jpg" },
    { name: "Verloopsok malleabel zwart ¾x½ bn", code: "0550810", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/43/82/11854382.jpg" },
    { name: "Verloopsok malleabel zwart 1x¾ bn", code: "0550815", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/43/85/11854385.jpg" },
  ],
  "Lade 5": [
    { name: "T-koppeling malleabel zwart ½ bn", code: "0550303", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/82/11854282.jpg" },
    { name: "T-koppeling malleabel zwart ¾ bn", code: "0550304", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/83/11854283.jpg" },
    { name: "T-koppeling malleabel zwart 1 bn", code: "0550305", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/42/84/11854284.jpg" },
    { name: "Verloopring malleabel zwart ¾x½", code: "0550870", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/44/12/11854412.jpg" },
    { name: "3-del. koppeling malleabel zwart ½ bn", code: "0551303", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/40/11854540.jpg" },
    { name: "3-del. koppeling malleabel zwart ¾ bn", code: "0551304", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/41/11854541.jpg" },
    { name: "3-del. koppeling malleabel zwart 1 bn", code: "0551305", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/45/42/11854542.jpg" },
  ],
  "Lade 6": [
    { name: "Lassok zwart ⅜ bn", code: "0190811", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/85/11800785.jpg" },
    { name: "Lassok zwart ½ bn", code: "0190806", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/82/11800782.jpg" },
    { name: "Lassok zwart ¾ bn", code: "0190810", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/85/11800785.jpg" },
    { name: "Lassok zwart 1 bn", code: "0190803", qty: 6, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/07/85/11800785.jpg" },
    { name: "Lasbocht 90° ½", code: "0559002", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/12/11856212.jpg" },
    { name: "Lasbocht 90° ¾", code: "0559004", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/18/11856218.jpg" },
    { name: "Lasbocht 90° 1", code: "0559007", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/62/24/11856224.jpg" },
    { name: "Pijpnippel zwart ½ x 60mm", code: "0190839", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart ¾ x 60mm", code: "0190853", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
    { name: "Pijpnippel zwart 1 x 60mm", code: "0190817", qty: 4, img: "https://pimassetsprdst.blob.core.windows.net/assets/apc_JPG300X300/49/37/11854937.jpg" },
  ],
  "Lade 7": [],
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
.drawer-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.drawer-btn { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px 8px; cursor:pointer; transition:all .2s; text-align:center; color:var(--text); font-family:'DM Sans',sans-serif; }
.drawer-btn:active { transform:scale(0.95); }
.drawer-btn:hover { border-color:var(--accent); background:var(--surface2); }
.drawer-btn .num { font-family:'Space Mono',monospace; font-size:22px; font-weight:700; color:var(--accent); }
.drawer-btn .dtxt { font-size:11px; color:var(--text2); margin-top:4px; }
.drawer-btn.empty { opacity:.35; }
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

// ─── MAIN APP ───────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [busInfo, setBusInfo] = useState(null);
  const [authScreen, setAuthScreen] = useState("welcome");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authBusName, setAuthBusName] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [side, setSide] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [latestInviteCode, setLatestInviteCode] = useState("");
  const [approvedCreators, setApprovedCreators] = useState([]);
  const [newCreatorEmail, setNewCreatorEmail] = useState("");
  const [isMainAdmin, setIsMainAdmin] = useState(false);
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
        : memberRows.map(m => ({
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

  if (busRow) {
    const members = (memberRows || []).map(m => ({
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

    if (!members.some(m => m.id === session.userId)) {
      localStorage.removeItem("my-session");
      setSession(null);
      setBusInfo(null);
      setCart([]);
    }
  }
}, [session]);

useEffect(() => {
  if (!session) return;
  pollRef.current = setInterval(refreshData, 8000);
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

  if (!name || !email || !busName) {
    setAuthError("Vul alle velden in");
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

  if (creatorError) {
    setAuthError("Controle van toegestane e-mail mislukt");
    return;
  }

  const isAllowed = !!adminRow || !!creatorRow;

  const userId = genId();
  const code = genBusCode();

  const { error: busInsertError } = await supabase
    .from("buses")
    .insert({
      code,
      name: busName,
      owner_email: email,
      owner_name: name,
    });

  if (busInsertError) {
    setAuthError("Bus opslaan mislukt");
    return;
  }

  // 🔒 markeer e-mail als gebruikt (indien single_use)
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

  await supabase
    .from("bus_members")
    .delete()
    .eq("bus_code", busInfo.code)
    .eq("member_id", mid);

  const updatedMembers = busInfo.members.filter(m => m.id !== mid);

  setBusInfo({
    ...busInfo,
    members: updatedMembers,
  });
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
    .order("email", { ascending: true });

  if (!error) {
    setApprovedCreators(data || []);
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
      },
      { onConflict: "email" }
    );

  showToastMsg("Toevoegen mislukt");

  setNewCreatorEmail("");
  showToastMsg("Monteur toegevoegd");
  await loadApprovedCreators();
};

const removeApprovedCreator = async (email) => {
  const { error } = await supabase
    .from("approved_creators")
    .delete()
    .eq("email", email);

  if (error) {
    showToastMsg("Verwijderen mislukt");
    return;
  }

  showToastMsg("Monteur verwijderd");
  await loadApprovedCreators();
};

  const logout = async () => {
  localStorage.removeItem("my-session");
  setSession(null);
  setBusInfo(null);
  setCart([]);
  setAuthScreen("welcome");
  setAuthName("");
  setAuthEmail("");
  setAuthCode("");
  setAuthBusName("");
  setAuthError("");
  setView("home");
  setSide(null);
  setDrawer(null);
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
    let body = `Beste,\n\nOnderstaande materialen komen uit de busvoorraad van ${busInfo?.name || "onze bus"}. Zou je deze kunnen bestellen op het project zodat we deze weer kunnen aanvullen?\n\n`;
    cart.forEach(c => { body += `${c.quantity}x ${c.name} (${c.code})\n`; });
    body += `\nVerzonden door: ${session?.name}`;
    window.open(`mailto:?subject=Bestellijst ${busInfo?.name || "Bus"}&body=${encodeURIComponent(body)}`, '_self');
    await clearCartAll(); setShowCart(false); showToastMsg("Bestellijst verzonden!");
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
      <div className="auth-logo"><img src="/logo.png" alt="logo" style={{height:'28px',objectFit:'contain',marginRight:8,verticalAlign:'middle'}} />Bonarius</div>
      {authScreen === "welcome" && <><div className="auth-title">Voorraadbeheer</div><div style={{textAlign:'center',color:'var(--text2)',fontSize:14,marginBottom:24}}>Beheer de voorraad in je bedrijfsbus samen met je team</div><button className="auth-btn auth-btn-primary" onClick={() => { setAuthScreen("create"); setAuthError(""); }}>🚐 Nieuwe bus aanmaken</button><div className="auth-divider">of</div><button className="auth-btn auth-btn-blue" onClick={() => { setAuthScreen("join"); setAuthError(""); }}>🔑 Deelnemen aan een bus</button></>}
      {authScreen === "create" && <>
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

  <button className="auth-btn auth-btn-primary" onClick={createBus}>
    Bus aanmaken
  </button>

  <button className="auth-btn auth-btn-secondary" onClick={() => setAuthScreen("welcome")}>
    Terug
  </button>

  <div className="auth-sub">
    Alleen goedgekeurde e-mailadressen mogen een nieuwe bus aanmaken
  </div>
</>}
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
          <div key={row.email} className="member-item">
            <div>
              <div className="member-name">{row.email}</div>
              <div className="member-role">
  {row.email === "m.slootemaker@bonarius.com"
    ? "hoofdadmin"
    : row.active
    ? "toegestaan"
    : "inactief"}
</div>
            </div>

            {row.email !== "m.slootemaker@bonarius.com" && (
  <button
    className="member-remove"
    onClick={() => removeApprovedCreator(row.email)}
  >
    Verwijderen
  </button>
)}
          </div>
        ))
      )}
    </div>
  </div>
)}
        <button className="auth-btn auth-btn-secondary" onClick={logout} style={{marginTop:16}}>Uitloggen</button>
      </div>
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
              <button onClick={() => { refreshData(); loadApprovedCreators(); setShowSettings(true); }} style={{width:44,height:44,borderRadius:12,border:'none',background:'var(--surface2)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IconGear/></button>
            </div>
          </div>
        </div>
        <div className="breadcrumb"><span onClick={goHome} className={view==="home"?"active":""}>Home</span>{(view==="linker"||view==="rechter"||view==="drawer")&&<><span className="sep">›</span><span onClick={() => goSide(side)} className={view!=="drawer"?"active":""}>{side==="linker"?"Linker Stelling":"Rechter Stelling"}</span></>}{view==="drawer"&&<><span className="sep">›</span><span className="active">{drawer}</span></>}</div>
      </div>

      {view === "home" && <div className="van-view"><div className="van-svg-container"><VanSVG onClickLeft={() => goSide("linker")} onClickRight={() => goSide("rechter")} /></div><div className="side-cards"><div className="side-card" onClick={() => goSide("linker")}><div className="icon">🔧</div><div className="label">Linker Stelling</div><div className="sub">12 laden • Pers & Gas</div></div><div className="side-card" onClick={() => goSide("rechter")}><div className="icon">⚙️</div><div className="label">Rechter Stelling</div><div className="sub">7 laden • Knel & Las</div></div></div></div>}

      {(view === "linker" || view === "rechter") && <div className="drawer-list"><div className="drawer-grid">{Object.entries(data).map(([name, items]) => { const isInfo = items && items._info; const count = Array.isArray(items) ? items.length : 0; const isEmpty = !isInfo && count === 0; return <button key={name} className={`drawer-btn ${isEmpty?'empty':''}`} onClick={() => !isEmpty && goDrawer(name)}><div className="num">{name.replace("Lade ","")}</div><div className="dtxt">{isInfo ? items._info : count > 0 ? `${count} art.` : "Leeg"}</div></button>; })}</div></div>}

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
