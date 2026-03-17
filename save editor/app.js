const state = {
  summary: {
    cycle: 2,
    cycleDay: 8,
    science: 2890,
    beavers: 21,
  },
  beavers: [],
  storages: [],
  construction: [],
  cheats: {
    neverDie: false,
    infStorage: false,
    unlimitedWater: false,
    sciencePoints: null,
    noDrought: false,
    unlockAll: false,
    fastConstruction: false,
    easyConstruction: false,
    noOldAge: false,
    noNeeds: false,
    perfectNeeds: false,
    gameSpeed: null,
  },
};

const currentSave = {
  fileName: null,
  zip: null,
  world: null,
  baselineNeedMod: null,
  beaverSeed: null,
};

const BEAVER_SEED = {
  Id: "seed",
  Template: "BeaverAdult",
  Components: {
    Character: {
      Position: { X: 0, Y: 0, Z: 0 },
      Alive: true,
      DayOfBirth: 0,
    },
    LifeProgressor: { LifeProgress: 0.5 },
    BeaverLongevity: { ExpectedLongevity: 1.0 },
    NamedEntity: { EntityName: "Beaver" },
    Citizen: { AssignedDistrict: null },
    CharacterModel: {
      Rotation: { X: 0.0, Y: 0.0, Z: 0.0, W: 1.0 },
    },
    NeedManager: { Needs: [] },
  },
};

const navButtons = document.querySelectorAll(".nav-btn");
const panels = document.querySelectorAll(".panel");
const sectionTitle = document.getElementById("sectionTitle");
const sectionSubtitle = document.getElementById("sectionSubtitle");
const saveButton = document.getElementById("saveTimber");
const saveStatus = document.getElementById("saveStatus");

const sectionMeta = {
  beavers: "Manage population and details.",
  storage: "Edit storage items and amounts.",
  construction: "Adjust structure counts.",
  cheats: "Toggle cheat options.",
};

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.section;
    panels.forEach((p) => p.classList.remove("active"));
    document.getElementById(target).classList.add("active");
    sectionTitle.textContent = btn.textContent.trim();
    sectionSubtitle.textContent = sectionMeta[target] || "";
  });
});

function setSaveStatus(text, enabled) {
  saveStatus.textContent = text;
  saveButton.disabled = !enabled;
}

function renderSummary() {
  document.getElementById("summaryCycle").textContent = `${state.summary.cycle}-${state.summary.cycleDay}`;
  document.getElementById("summaryScience").textContent = state.summary.science;
  document.getElementById("summaryBeavers").textContent = state.summary.beavers;
}

function buildRow(values, onRemove) {
  const row = document.createElement("div");
  row.className = "row";
  values.forEach((value) => row.appendChild(value));
  const actions = document.createElement("div");
  actions.className = "actions";
  const removeBtn = document.createElement("button");
  removeBtn.className = "btn";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", onRemove);
  actions.appendChild(removeBtn);
  row.appendChild(actions);
  return row;
}

function renderBeavers() {
  const table = document.getElementById("beaverTable");
  table.innerHTML = "";
  const header = document.createElement("div");
  header.className = "row header";
  header.innerHTML = "<div>Name</div><div>Age</div><div>Job</div><div>Status</div><div></div>";
  table.appendChild(header);

  state.beavers.forEach((beaver, index) => {
    const name = document.createElement("input");
    name.value = beaver.name || "";
    name.addEventListener("input", (e) => (beaver.name = e.target.value));

    const age = document.createElement("select");
    ["Adult", "Child"].forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      if (beaver.age === opt) option.selected = true;
      age.appendChild(option);
    });
    age.addEventListener("change", (e) => (beaver.age = e.target.value));

    const job = document.createElement("input");
    job.value = beaver.job || "";
    job.addEventListener("input", (e) => (beaver.job = e.target.value));

    const status = document.createElement("input");
    status.value = beaver.status || "";
    status.addEventListener("input", (e) => (beaver.status = e.target.value));

    const row = buildRow([name, age, job, status], () => {
      state.beavers.splice(index, 1);
      renderBeavers();
      state.summary.beavers = state.beavers.length;
      renderSummary();
    });
    table.appendChild(row);
  });
}

function renderStorage() {
  const table = document.getElementById("storageTable");
  table.innerHTML = "";
  const header = document.createElement("div");
  header.className = "row header";
  header.innerHTML =
    "<div>Type</div><div>Item</div><div>Amount</div><div>Location</div><div>Status</div><div></div>";
  table.appendChild(header);

  updateStorageButtonLabel();

  state.storages.forEach((storage, index) => {
    const type = document.createElement("input");
    type.value = storage.type || "";
    type.addEventListener("input", (e) => (storage.type = e.target.value));

    const item = document.createElement("input");
    item.value = storage.item || "";
    item.addEventListener("input", (e) => (storage.item = e.target.value));

    const amount = document.createElement("input");
    amount.type = "number";
    amount.min = "0";
    amount.value = storage.amount ?? 0;
    amount.addEventListener("input", (e) => (storage.amount = Number(e.target.value)));

    const location = document.createElement("input");
    location.value = storage.location || "";
    location.addEventListener("input", (e) => (storage.location = e.target.value));

    const status = document.createElement("div");
    status.textContent = storage.incomplete ? "Incomplete" : "OK";
    status.style.color = storage.incomplete ? "#b04b3b" : "#2f5f4c";

    const row = document.createElement("div");
    row.className = "row";
    [type, item, amount, location, status].forEach((value) => row.appendChild(value));
    const actions = document.createElement("div");
    actions.className = "actions";

    if (storage.incomplete) {
      const completeBtn = document.createElement("button");
      completeBtn.className = "btn";
      completeBtn.textContent = "Complete";
      completeBtn.addEventListener("click", () => {
        storage.incomplete = false;
        storage.forceComplete = true;
        renderStorage();
      });
      actions.appendChild(completeBtn);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      state.storages.splice(index, 1);
      renderStorage();
    });
    actions.appendChild(removeBtn);
    row.appendChild(actions);
    table.appendChild(row);
  });
}

function renderConstruction() {
  const table = document.getElementById("constructionTable");
  table.innerHTML = "";
  const header = document.createElement("div");
  header.className = "row header";
  header.innerHTML = "<div>Structure</div><div>Count</div><div></div><div></div><div></div>";
  table.appendChild(header);
  state.construction.forEach((entry, index) => {
    const type = document.createElement("div");
    type.textContent = entry.type || "";

    const count = document.createElement("div");
    count.textContent = entry.count ?? 0;

    const filler1 = document.createElement("div");
    const filler2 = document.createElement("div");

    const row = buildRow([type, count, filler1, filler2], () => {});
    table.appendChild(row);
  });
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isLivingBeaverEntity(entity) {
  return entity?.Template === "BeaverAdult" || entity?.Template === "BeaverChild";
}

function isStorageTemplate(template) {
  return /Tank|Pile|Warehouse/i.test(template || "");
}

function getComponent(entity, name) {
  if (!entity || !entity.Components) return null;
  return entity.Components[name] || null;
}

function ensureComponent(entity, name, defaultValue) {
  if (!entity.Components[name]) {
    entity.Components[name] = defaultValue;
  }
  return entity.Components[name];
}

function loadFromWorld(world) {
  const beaverEntities = world.Entities.filter(isLivingBeaverEntity);
  state.beavers = beaverEntities.map((entity) => {
    const named = getComponent(entity, "NamedEntity");
    const worker = getComponent(entity, "Worker");
    const character = getComponent(entity, "Character");
    const age = entity.Template === "BeaverChild" ? "Child" : "Adult";
    return {
      id: entity.Id,
      name: named?.EntityName || "",
      age,
      job: worker?.Workplace || "",
      status: character?.Alive === false ? "Dead" : "Alive",
    };
  });

  state.storages = world.Entities.filter((entity) => isStorageTemplate(entity.Template)).map(
    (entity) => {
      const coords = entity.Components.BlockObject?.Coordinates;
      const allowed = entity.Components.SingleGoodAllower?.AllowedGood || "";
      const stockpile = entity.Components["Inventory:Stockpile"];
      const goods = stockpile?.Storage?.Goods || [];
      const first = goods[0] || {};
      return {
        id: entity.Id,
        type: entity.Template,
        item: first.Good || allowed || "",
        amount: first.Amount ?? 0,
        location: coords ? `${coords.X},${coords.Y},${coords.Z}` : "",
        incomplete: !stockpile,
        forceComplete: false,
      };
    }
  );

  const folktails = world.Entities.filter((entity) => entity.Template?.includes(".Folktails"));
  const group = {};
  folktails.forEach((entity) => {
    group[entity.Template] = (group[entity.Template] || 0) + 1;
  });
  state.construction = Object.entries(group).map(([type, count]) => ({ type, count }));

  const cycle = world.Singletons?.GameCycleService?.Cycle ?? state.summary.cycle;
  const cycleDay = world.Singletons?.GameCycleService?.CycleDay ?? state.summary.cycleDay;
  const science = world.Singletons?.ScienceService?.SciencePoints ?? state.summary.science;
  state.summary = {
    cycle,
    cycleDay,
    science,
    beavers: state.beavers.length,
  };

  renderSummary();
  renderBeavers();
  renderStorage();
  renderConstruction();
}

function getDistrictCenter(world) {
  const district = world.Entities.find((e) => e.Template?.includes("DistrictCenter"));
  const coords = district?.Components?.BlockObject?.Coordinates;
  return {
    id: district?.Id || null,
    position: coords ? { X: coords.X + 0.5, Y: coords.Z + 1, Z: coords.Y + 0.5 } : null,
  };
}

function randomBeaverName(world) {
  const names = world.Singletons?.BeaverNameService?.Names || [];
  if (names.length === 0) return "Beaver";
  return names[Math.floor(Math.random() * names.length)];
}

function applyCheats(world) {
  if (state.cheats.sciencePoints !== null) {
    if (world.Singletons?.ScienceService) {
      world.Singletons.ScienceService.SciencePoints = Number(state.cheats.sciencePoints || 0);
    }
  }

  if (state.cheats.neverDie) {
    if (world.Singletons && world.Singletons.NeedModificationService) {
      world.Singletons.NeedModificationService.FoodConsumption = 0;
      world.Singletons.NeedModificationService.WaterConsumption = 0;
    }
  } else if (currentSave.baselineNeedMod) {
    world.Singletons.NeedModificationService = { ...currentSave.baselineNeedMod };
  }

  if (state.cheats.noDrought) {
    if (world.Singletons?.DroughtWeather) {
      world.Singletons.DroughtWeather.MinDroughtDuration = 0;
      world.Singletons.DroughtWeather.MaxDroughtDuration = 0;
      world.Singletons.DroughtWeather.HandicapMultiplier = 0;
    }
    if (world.Singletons?.HazardousWeatherService) {
      world.Singletons.HazardousWeatherService.IsDrought = false;
      world.Singletons.HazardousWeatherService.HazardousWeatherDuration = 0;
    }
  }

  if (state.cheats.unlockAll) {
    const unlock = world.Singletons?.BuildingUnlockingService;
    if (unlock) {
      const templates = world.Entities.map((e) => e.Template).filter((t) =>
        t && (t.includes(".IronTeeth") || t.includes(".Folktails"))
      );
      unlock.UnlockedBuildings = Array.from(new Set(templates)).sort();
    }
  }

  if (state.cheats.infStorage) {
    world.Entities.forEach((entity) => {
      const stockpile = entity.Components?.["Inventory:Stockpile"];
      if (!stockpile?.Storage?.Goods) return;
      stockpile.Storage.Goods.forEach((good) => {
        good.Amount = Math.max(Number(good.Amount || 0), 9999);
      });
    });
  }

  if (state.cheats.unlimitedWater) {
    world.Entities.forEach((entity) => {
      Object.values(entity.Components || {}).forEach((comp) => {
        if (!comp?.Storage?.Goods) return;
        comp.Storage.Goods.forEach((good) => {
          if (good.Good === "Water") {
            good.Amount = Math.max(Number(good.Amount || 0), 9999);
          }
        });
      });
    });
  }

  if (state.cheats.noOldAge) {
    world.Entities.forEach((entity) => {
      if (entity.Template !== "BeaverAdult" && entity.Template !== "BeaverChild") return;
      if (entity.Components?.BeaverLongevity) {
        entity.Components.BeaverLongevity.ExpectedLongevity = 1000;
      }
      if (entity.Components?.LifeProgressor) {
        entity.Components.LifeProgressor.LifeProgress = 0.01;
      }
    });
  }

  if (state.cheats.noNeeds || state.cheats.perfectNeeds) {
    if (state.cheats.noNeeds && world.Singletons?.NeedModificationService) {
      world.Singletons.NeedModificationService.FoodConsumption = 0;
      world.Singletons.NeedModificationService.WaterConsumption = 0;
    }
    world.Entities.forEach((entity) => {
      if (entity.Template !== "BeaverAdult" && entity.Template !== "BeaverChild") return;
      const needs = entity.Components?.NeedManager?.Needs;
      if (Array.isArray(needs)) {
        needs.forEach((need) => {
          if (typeof need.Points === "number") {
            need.Points = 1;
          }
        });
      }
    });
  }

  if (state.cheats.easyConstruction || state.cheats.fastConstruction) {
    world.Entities.forEach((entity) => {
      const components = entity.Components || {};
      Object.entries(components).forEach(([name, comp]) => {
        if (!name.includes("ConstructionSite") || !comp) return;
        if (state.cheats.easyConstruction && comp.Storage?.Goods) {
          comp.Storage.Goods.forEach((good) => {
            good.Amount = Math.max(Number(good.Amount || 0), 9999);
          });
        }
        if (state.cheats.fastConstruction) {
          Object.keys(comp).forEach((key) => {
            const val = comp[key];
            if (typeof val !== "number") return;
            if (key.toLowerCase().includes("progress")) {
              comp[key] = 1;
            } else if (key.toLowerCase().includes("remaining") || key.toLowerCase().includes("work")) {
              comp[key] = 0;
            }
          });
        }
      });
    });
  }

  if (state.cheats.gameSpeed !== null) {
    const speed = Number(state.cheats.gameSpeed);
    const speedServices = [
      ["GameSpeedService", "Speed"],
      ["TimeScaleService", "TimeScale"],
      ["TimeScaleService", "Speed"],
    ];
    speedServices.forEach(([svc, key]) => {
      if (world.Singletons?.[svc] && typeof speed === "number") {
        world.Singletons[svc][key] = speed;
      }
    });
  }
}

function updateWorldFromState(world) {
  const beaverIds = new Set(state.beavers.filter((b) => b.id).map((b) => b.id));
  const kept = world.Entities.filter((entity) => {
    return !isLivingBeaverEntity(entity) || beaverIds.has(entity.Id);
  });

  const existingBeavers = new Map();
  kept.forEach((entity) => {
    if (isLivingBeaverEntity(entity)) {
      existingBeavers.set(entity.Id, entity);
    }
  });

  const templateBeaver =
    kept.find((e) => e.Template === "BeaverAdult") ||
    kept.find((e) => e.Template === "BeaverChild") ||
    currentSave.beaverSeed;

  const beaversToAdd = [];
  state.beavers.forEach((beaver) => {
    let entity = beaver.id ? existingBeavers.get(beaver.id) : null;
    if (!entity && templateBeaver) {
      entity = JSON.parse(JSON.stringify(templateBeaver));
      entity.Id = uuidv4();
      beaver.id = entity.Id;
      entity.Components = entity.Components || {};
      beaversToAdd.push(entity);
    }
    if (!entity) return;
    entity.Template = beaver.age === "Child" ? "BeaverChild" : "BeaverAdult";
    const named = ensureComponent(entity, "NamedEntity", { EntityName: "" });
    named.EntityName = beaver.name || named.EntityName || "Beaver";
    const character = ensureComponent(entity, "Character", { Alive: true });
    character.Alive = beaver.status !== "Dead";
    if (entity.Components.Worker) {
      entity.Components.Worker.Workplace = beaver.job || entity.Components.Worker.Workplace || null;
    }
  });

  const updatedEntities = kept.concat(beaversToAdd);

  state.storages.forEach((storage) => {
    if (!storage.id) return;
    const entity = updatedEntities.find((e) => e.Id === storage.id);
    if (!entity) return;
    if (!entity.Components["Inventory:Stockpile"] && storage.forceComplete) {
      entity.Components["Inventory:Stockpile"] = { Storage: { Goods: [] } };
    }
    const stockpile = entity.Components["Inventory:Stockpile"];
    if (!stockpile) return;
    const allowed = ensureComponent(entity, "SingleGoodAllower", { AllowedGood: "" });
    allowed.AllowedGood = storage.item || allowed.AllowedGood || "";
    const visual = ensureComponent(entity, "StockpileVisualizers", { CurrentGood: "" });
    visual.CurrentGood = storage.item || visual.CurrentGood || "";
    const goods = stockpile.Storage?.Goods || [];
    stockpile.Storage = stockpile.Storage || { Goods: [] };
    if (goods.length > 0) {
      goods[0].Good = storage.item || goods[0].Good;
      goods[0].Amount = Number(storage.amount || 0);
      stockpile.Storage.Goods = [goods[0]];
    } else if (storage.item) {
      stockpile.Storage.Goods = [{ Good: storage.item, Amount: Number(storage.amount || 0) }];
    } else if (storage.forceComplete) {
      stockpile.Storage.Goods = [];
    }
  });

  world.Entities = updatedEntities;
  applyCheats(world);
}

async function loadTimber(file) {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const worldText = await zip.file("world.json").async("string");
  const world = JSON.parse(worldText);

  currentSave.fileName = file.name;
  currentSave.zip = zip;
  currentSave.world = world;
  currentSave.baselineNeedMod = world.Singletons?.NeedModificationService
    ? { ...world.Singletons.NeedModificationService }
    : null;
  const existingBeaver = world.Entities.find((e) => isLivingBeaverEntity(e));
  if (existingBeaver) {
    currentSave.beaverSeed = JSON.parse(JSON.stringify(existingBeaver));
  } else {
    const district = getDistrictCenter(world);
    const seed = JSON.parse(JSON.stringify(BEAVER_SEED));
    if (district.position) {
      seed.Components.Character.Position = district.position;
    }
    seed.Components.Citizen.AssignedDistrict = district.id;
    currentSave.beaverSeed = seed;
  }

  loadFromWorld(world);
  setSaveStatus(`Loaded ${file.name}`, true);
}

async function saveTimber() {
  if (!currentSave.zip || !currentSave.world) return;
  const worldClone = JSON.parse(JSON.stringify(currentSave.world));
  updateWorldFromState(worldClone);
  currentSave.zip.file("world.json", JSON.stringify(worldClone));
  const blob = await currentSave.zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  const outName = currentSave.fileName?.replace(/\.timber$/i, "") + "_edited.timber";
  a.href = URL.createObjectURL(blob);
  a.download = outName || "save_edited.timber";
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById("addBeaver").addEventListener("click", () => {
  const name = currentSave.world ? randomBeaverName(currentSave.world) : "New Beaver";
  state.beavers.push({ name, age: "Adult", job: "", status: "Alive" });
  renderBeavers();
  state.summary.beavers = state.beavers.length;
  renderSummary();
});

document.getElementById("addStorage").addEventListener("click", () => {
  const incomplete = state.storages.filter((s) => s.incomplete);
  if (incomplete.length > 0) {
    incomplete.forEach((s) => {
      s.incomplete = false;
      s.forceComplete = true;
    });
    renderStorage();
    return;
  }
  state.storages.push({ type: "", item: "", amount: 0, location: "", id: null });
  renderStorage();
});

function updateStorageButtonLabel() {
  const btn = document.getElementById("addStorage");
  const count = state.storages.filter((s) => s.incomplete).length;
  if (count > 0) {
    btn.textContent = `Complete Incomplete (${count})`;
  } else {
    btn.textContent = "Add Storage";
  }
}

document.getElementById("spawnBeavers").addEventListener("click", () => {
  const count = Number(document.getElementById("cheatSpawnCount").value || 0);
  for (let i = 0; i < count; i += 1) {
    const name = currentSave.world ? randomBeaverName(currentSave.world) : "Spawned";
    state.beavers.push({ name, age: "Adult", job: "", status: "Alive" });
  }
  renderBeavers();
  state.summary.beavers = state.beavers.length;
  renderSummary();
});

document.getElementById("cheatNeverDie").addEventListener("change", (e) => {
  state.cheats.neverDie = e.target.checked;
});
document.getElementById("cheatInfStorage").addEventListener("change", (e) => {
  state.cheats.infStorage = e.target.checked;
});
document.getElementById("cheatUnlimitedWater").addEventListener("change", (e) => {
  state.cheats.unlimitedWater = e.target.checked;
});
document.getElementById("cheatNoDrought").addEventListener("change", (e) => {
  state.cheats.noDrought = e.target.checked;
});
document.getElementById("cheatUnlockAll").addEventListener("change", (e) => {
  state.cheats.unlockAll = e.target.checked;
});
document.getElementById("cheatFastConstruction").addEventListener("change", (e) => {
  state.cheats.fastConstruction = e.target.checked;
});
document.getElementById("cheatEasyConstruction").addEventListener("change", (e) => {
  state.cheats.easyConstruction = e.target.checked;
});
document.getElementById("cheatNoOldAge").addEventListener("change", (e) => {
  state.cheats.noOldAge = e.target.checked;
});
document.getElementById("cheatNoNeeds").addEventListener("change", (e) => {
  state.cheats.noNeeds = e.target.checked;
});
document.getElementById("cheatPerfectNeeds").addEventListener("change", (e) => {
  state.cheats.perfectNeeds = e.target.checked;
});

document.getElementById("applyScience").addEventListener("click", () => {
  const val = Number(document.getElementById("cheatSciencePoints").value);
  if (Number.isFinite(val)) {
    state.cheats.sciencePoints = val;
    state.summary.science = val;
    renderSummary();
  }
});

document.getElementById("applyGameSpeed").addEventListener("click", () => {
  const val = Number(document.getElementById("cheatGameSpeed").value);
  if (Number.isFinite(val)) {
    state.cheats.gameSpeed = val;
  }
});

document.getElementById("importSave").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  loadTimber(file).catch((err) => {
    console.error("Failed to load save", err);
    setSaveStatus("Failed to load save", false);
  });
});

document.getElementById("importSummary").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const summary = JSON.parse(evt.target.result);
      const cycle = summary.Cycle ?? state.summary.cycle;
      const cycleDay = summary.CycleDay ?? state.summary.cycleDay;
      const science = summary.SciencePoints ?? state.summary.science;
      const beaverAdult = (summary.BeaverCounts || []).find((b) => b.Template === "BeaverAdult");
      const beaverChild = (summary.BeaverCounts || []).find((b) => b.Template === "BeaverChild");
      const beaverTotal = (beaverAdult?.Count || 0) + (beaverChild?.Count || 0);
      state.summary = {
        cycle,
        cycleDay,
        science,
        beavers: beaverTotal || state.summary.beavers,
      };

      if (Array.isArray(summary.Stockpiles)) {
        state.storages = summary.Stockpiles.map((s) => {
          const goods = Array.isArray(s.Goods) && s.Goods.length > 0 ? s.Goods[0] : null;
          return {
            id: s.Id || null,
            type: s.Template || "",
            item: goods?.Good || s.AllowedGood || "",
            amount: goods?.Amount || 0,
            location: `${s.X},${s.Y},${s.Z}`,
          };
        });
      }
      renderSummary();
      renderStorage();
    } catch (err) {
      console.error("Invalid summary JSON", err);
    }
  };
  reader.readAsText(file);
});

saveButton.addEventListener("click", () => {
  saveTimber().catch((err) => {
    console.error("Failed to save", err);
  });
});

setSaveStatus("No save loaded", false);
renderSummary();
renderBeavers();
renderStorage();
renderConstruction();
