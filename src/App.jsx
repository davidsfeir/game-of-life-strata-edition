import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function App() {
  const mountRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(500);
  const [gridSize] = useState(500);
  const [selectedPattern, setSelectedPattern] = useState('glider'); // Start with glider
  const [autoRotate, setAutoRotate] = useState(false);
  const [cubeColor, setCubeColor] = useState('white');
  const [highlightNew, setHighlightNew] = useState(false);
  const [lightPosition, setLightPosition] = useState('current');
  const [lightIntensity, setLightIntensity] = useState(1.5);
  
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const gridRef = useRef(null);
  const cubesRef = useRef([]);
  const setupCubesRef = useRef(new Map());
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const isRunningRef = useRef(false);
  const generationRef = useRef(0);
  const speedRef = useRef(500);
  const pointLightRef = useRef(null);
  const pointLight2Ref = useRef(null);
  const topLightRef = useRef(null);
  const autoRotateRef = useRef(false);
  const highlightNewRef = useRef(false);
  const cubeColorRef = useRef('white');
  const lightPositionRef = useRef('current');
  const lightIntensityRef = useRef(1.5);
  
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const didDragRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4 });
  const cameraDistanceRef = useRef(150); // CLOSER - was 400
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  const patterns = {
    // GLIDERS & SMALL SPACESHIPS
    glider: {
      name: "Glider",
      cells: [[1,0], [2,1], [0,2], [1,2], [2,2]],
      creator: "Richard K. Guy",
      year: 1970
    },
    lwss: {
      name: "Lightweight Spaceship",
      cells: [[1,0], [4,0], [0,1], [0,2], [4,2], [0,3], [1,3], [2,3], [3,3]],
      creator: "John Conway",
      year: 1970
    },
    mwss: {
      name: "Middleweight Spaceship",
      cells: [[2,0], [0,1], [4,1], [0,2], [0,3], [4,3], [0,4], [1,4], [2,4], [3,4]],
      creator: "John Conway",
      year: 1970
    },
    hwss: {
      name: "Heavyweight Spaceship",
      cells: [[2,0], [3,0], [0,1], [5,1], [0,2], [0,3], [5,3], [0,4], [1,4], [2,4], [3,4], [4,4]],
      creator: "John Conway",
      year: 1970
    },
    
    // PERIOD 2 OSCILLATORS
    blinker: {
      name: "Blinker",
      cells: [[1,0], [1,1], [1,2]],
      creator: "John Conway",
      year: 1970
    },
    toad: {
      name: "Toad",
      cells: [[1,1], [2,1], [3,1], [0,2], [1,2], [2,2]],
      creator: "Simon Norton",
      year: 1970
    },
    beacon: {
      name: "Beacon",
      cells: [[0,0], [1,0], [0,1], [3,2], [2,3], [3,3]],
      creator: "John Conway",
      year: 1970
    },
    clock: {
      name: "Clock",
      cells: [[1,0], [2,0], [0,1], [3,1], [0,2], [3,2], [1,3], [2,3]],
      creator: "Simon Norton",
      year: 1970
    },
    
    // LARGER OSCILLATORS
    pulsar: {
      name: "Pulsar",
      cells: [
        [2,0], [3,0], [4,0], [8,0], [9,0], [10,0],
        [0,2], [5,2], [7,2], [12,2],
        [0,3], [5,3], [7,3], [12,3],
        [0,4], [5,4], [7,4], [12,4],
        [2,5], [3,5], [4,5], [8,5], [9,5], [10,5],
        [2,7], [3,7], [4,7], [8,7], [9,7], [10,7],
        [0,8], [5,8], [7,8], [12,8],
        [0,9], [5,9], [7,9], [12,9],
        [0,10], [5,10], [7,10], [12,10],
        [2,12], [3,12], [4,12], [8,12], [9,12], [10,12]
      ],
      creator: "John Conway",
      year: 1970
    },
    pentadecathlon: {
      name: "Pentadecathlon",
      cells: [[1,0], [1,1], [0,2], [2,2], [1,3], [1,4], [1,5], [1,6], [0,7], [2,7], [1,8], [1,9]],
      creator: "John Conway",
      year: 1970
    },
    figure8: {
      name: "Figure Eight",
      cells: [[0,0], [1,0], [2,0], [0,1], [1,1], [2,1], [3,3], [4,3], [5,3], [3,4], [4,4], [5,4]],
      creator: "Simon Norton",
      year: 1970
    },
    koksgalaxy: {
      name: "Kok's Galaxy",
      cells: [
        [0,0], [1,0], [2,0], [3,0], [4,0], [5,0], [6,0],
        [0,1], [6,1], [0,2], [6,2], [0,3], [6,3],
        [0,4], [6,4], [0,5], [6,5],
        [0,6], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6],
        [7,7], [8,7], [9,7], [10,7], [11,7], [12,7], [13,7],
        [7,8], [13,8], [7,9], [13,9], [7,10], [13,10],
        [7,11], [13,11], [7,12], [13,12],
        [7,13], [8,13], [9,13], [10,13], [11,13], [12,13], [13,13]
      ],
      creator: "David Bell",
      year: 1995
    },
    queenbee: {
      name: "Queen Bee Shuttle",
      cells: [
        [0,0], [1,0], [0,1], [2,2], [0,3], [1,3],
        [9,0], [10,0], [11,0], [8,1], [12,1], [8,2], [12,2], [9,3], [10,3], [11,3],
        [9,5], [10,5], [11,5], [8,6], [12,6], [8,7], [12,7], [9,8], [10,8], [11,8],
        [18,3], [19,3], [18,4], [20,5], [18,6], [19,6]
      ],
      creator: "Bill Gosper",
      year: 1970
    },
    
    // STILL LIFES
    block: {
      name: "Block",
      cells: [[0,0], [1,0], [0,1], [1,1]],
      creator: "John Conway",
      year: 1970
    },
    beehive: {
      name: "Beehive",
      cells: [[1,0], [2,0], [0,1], [3,1], [1,2], [2,2]],
      creator: "John Conway",
      year: 1970
    },
    loaf: {
      name: "Loaf",
      cells: [[1,0], [2,0], [0,1], [3,1], [1,2], [3,2], [2,3]],
      creator: "John Conway",
      year: 1970
    },
    boat: {
      name: "Boat",
      cells: [[0,0], [1,0], [0,1], [2,1], [1,2]],
      creator: "John Conway",
      year: 1970
    },
    tub: {
      name: "Tub",
      cells: [[1,0], [0,1], [2,1], [1,2]],
      creator: "John Conway",
      year: 1970
    },
    ship: {
      name: "Ship",
      cells: [[0,0], [1,0], [0,1], [2,1], [1,2], [2,2]],
      creator: "Unknown",
      year: 1970
    },
    barge: {
      name: "Barge",
      cells: [[1,0], [0,1], [2,1], [0,2], [2,2], [1,3]],
      creator: "Unknown",
      year: 1970
    },
    pond: {
      name: "Pond",
      cells: [[1,0], [2,0], [0,1], [3,1], [0,2], [3,2], [1,3], [2,3]],
      creator: "Unknown",
      year: 1970
    },
    
    // METHUSELAHS
    rpentomino: {
      name: "R-pentomino",
      cells: [[1,0], [2,0], [0,1], [1,1], [1,2]],
      creator: "John Conway",
      year: 1970
    },
    diehard: {
      name: "Diehard",
      cells: [[6,0], [0,1], [1,1], [1,2], [5,2], [6,2], [7,2]],
      creator: "Achim Flammenkamp",
      year: 1997
    },
    acorn: {
      name: "Acorn",
      cells: [[1,0], [3,1], [0,2], [1,2], [4,2], [5,2], [6,2]],
      creator: "Charles Corderman",
      year: 1971
    },
    bheptomino: {
      name: "B-heptomino",
      cells: [[1,0], [0,1], [1,1], [2,1], [0,2], [1,2], [2,3]],
      creator: "Unknown",
      year: 1970
    },
    piheptomino: {
      name: "Pi-heptomino",
      cells: [[0,0], [1,0], [2,0], [0,1], [2,1]],
      creator: "Unknown",
      year: 1970
    },
    thunderbird: {
      name: "Thunderbird",
      cells: [[0,0], [1,0], [2,0], [1,1], [1,2], [1,3]],
      creator: "Unknown",
      year: 1970
    },
    
    // GUNS & PUFFERS
    gosperGliderGun: {
      name: "Gosper Glider Gun",
      cells: [
        [0,4], [0,5], [1,4], [1,5],
        [10,4], [10,5], [10,6], [11,3], [11,7], [12,2], [12,8], [13,2], [13,8],
        [14,5], [15,3], [15,7], [16,4], [16,5], [16,6], [17,5],
        [20,2], [20,3], [20,4], [21,2], [21,3], [21,4], [22,1], [22,5],
        [24,0], [24,1], [24,5], [24,6],
        [34,2], [34,3], [35,2], [35,3]
      ],
      creator: "Bill Gosper",
      year: 1970
    },
    
    // EATERS & REFLECTORS
    eater1: {
      name: "Eater 1",
      cells: [[0,0], [1,0], [0,1], [2,1], [0,2], [2,3], [1,3]],
      creator: "Bill Gosper",
      year: 1970
    },
    
    // EXOTIC PATTERNS
    switch: {
      name: "Switch Engine",
      cells: [[0,0], [2,0], [0,1], [1,2], [0,3], [0,4], [2,4], [3,4], [4,4]],
      creator: "Charles Corderman",
      year: 1971
    },
    
    // UNCOMMON OSCILLATORS
    mold: {
      name: "Mold",
      cells: [[0,0], [1,0], [2,0], [3,0], [1,1], [0,2], [3,2], [1,3], [2,3]],
      creator: "Unknown",
      year: 1971
    },
    
    // FUSES
    burninship: {
      name: "Burning Ship",
      cells: [[0,0], [1,0], [0,1], [1,1], [2,2], [3,2], [2,3]],
      creator: "Unknown",
      year: 1970
    },
    
    // WICKS
    barberpole: {
      name: "Barberpole",
      cells: [[0,0], [1,0], [0,1], [1,1], [2,2], [3,2], [2,3], [3,3], [4,4], [5,4], [4,5], [5,5]],
      creator: "Unknown",
      year: 1970
    }
  };

  const initializeGrid = () => {
    const grid = [];
    for (let x = 0; x < gridSize; x++) {
      grid[x] = [];
      for (let y = 0; y < gridSize; y++) {
        grid[x][y] = 0;
      }
    }
    return grid;
  };

  const countNeighbors = (grid, x, y) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newX = x + i;
        const newY = y + j;
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
          count += grid[newX][newY];
        }
      }
    }
    return count;
  };

  const updateGrid = (grid) => {
    const newGrid = [];
    for (let x = 0; x < gridSize; x++) {
      newGrid[x] = [];
      for (let y = 0; y < gridSize; y++) {
        const neighbors = countNeighbors(grid, x, y);
        if (grid[x][y] === 1) {
          newGrid[x][y] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
        } else {
          newGrid[x][y] = neighbors === 3 ? 1 : 0;
        }
      }
    }
    return newGrid;
  };

  const updateCubeColors = () => {
    const currentGen = generationRef.current;
    cubesRef.current.forEach(cube => {
      if (cube.userData && cube.userData.generation !== undefined) {
        const z = cube.userData.generation;
        const isNewestLayer = z === currentGen;
        let color = 0xffffff;
        
        if (highlightNewRef.current && isNewestLayer) {
          color = 0x0088ff;
        } else if (cubeColorRef.current === 'blue') {
          color = 0x0088ff;
        } else if (cubeColorRef.current === 'rainbow') {
          const hue = (z / 100) % 1;
          color = new THREE.Color().setHSL(hue, 0.8, 0.5);
        } else if (cubeColorRef.current === 'fade') {
          const ratio = Math.min(z / 100, 1);
          color = new THREE.Color().lerpColors(
            new THREE.Color(0xffffff),
            new THREE.Color(0x0088ff),
            ratio
          );
        }
        
        cube.material.color.set(color);
      }
    });
  };

  const addGenerationLayer = (grid, z) => {
    const scene = sceneRef.current;
    const geometry = new THREE.BoxGeometry(5, 5, 5); // MUCH BIGGER - was 0.95
    const isNewestLayer = z === generationRef.current;
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (grid[x][y] === 1) {
          let color = 0xffffff;
          
          if (highlightNewRef.current && isNewestLayer) {
            color = 0x0088ff;
          } else if (cubeColorRef.current === 'blue') {
            color = 0x0088ff;
          } else if (cubeColorRef.current === 'rainbow') {
            const hue = (z / 100) % 1;
            color = new THREE.Color().setHSL(hue, 0.8, 0.5);
          } else if (cubeColorRef.current === 'fade') {
            const ratio = Math.min(z / 100, 1);
            color = new THREE.Color().lerpColors(
              new THREE.Color(0xffffff),
              new THREE.Color(0x0088ff),
              ratio
            );
          }
          
          const material = new THREE.MeshStandardMaterial({ 
            color: color,
            metalness: 0.3,
            roughness: 0.4
          });
          
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(x - gridSize / 2, y - gridSize / 2, z);
          cube.userData = { generation: z };
          scene.add(cube);
          cubesRef.current.push(cube);
        }
      }
    }
  };

  const updateSetupLayer = () => {
    const scene = sceneRef.current;
    if (!scene) return; // Safety check
    
    const geometry = new THREE.BoxGeometry(5, 5, 5); // MUCH BIGGER - was 0.95
    
    setupCubesRef.current.forEach(cube => {
      cube.geometry.dispose();
      cube.material.dispose();
      scene.remove(cube);
    });
    setupCubesRef.current.clear();
    
    let count = 0; // Debug counter
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (gridRef.current[x][y] === 1) {
          count++;
          let color = 0xffffff;
          if (cubeColorRef.current === 'blue') {
            color = 0x0088ff;
          }
          
          const material = new THREE.MeshStandardMaterial({ 
            color: color,
            metalness: 0.3,
            roughness: 0.4
          });
          
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(x - gridSize / 2, y - gridSize / 2, 0);
          scene.add(cube);
          setupCubesRef.current.set(`${x},${y}`, cube);
        }
      }
    }
    console.log(`Setup layer updated: ${count} cubes created`);
  };

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    
    const camera = cameraRef.current;
    const { theta, phi } = cameraAngleRef.current;
    const distance = cameraDistanceRef.current;
    const target = cameraTargetRef.current;
    
    camera.position.x = target.x + distance * Math.sin(phi) * Math.cos(theta);
    camera.position.y = target.y + distance * Math.sin(phi) * Math.sin(theta);
    camera.position.z = target.z + distance * Math.cos(phi);
    camera.lookAt(target);
  };

  const setView = (view) => {
    const targetZ = generationRef.current / 2;
    cameraTargetRef.current.set(0, 0, targetZ);
    
    switch(view) {
      case 'top':
        cameraAngleRef.current = { theta: 0, phi: 0.01 };
        break;
      case 'front':
        cameraAngleRef.current = { theta: 0, phi: Math.PI / 2 };
        break;
      case 'left':
        cameraAngleRef.current = { theta: Math.PI / 2, phi: Math.PI / 2 };
        break;
      case 'right':
        cameraAngleRef.current = { theta: -Math.PI / 2, phi: Math.PI / 2 };
        break;
      case 'free':
      default:
        cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 4 };
        break;
    }
    updateCameraPosition();
  };

  const handleMouseDown = (event) => {
    if (event.button === 1 || (event.shiftKey && event.button === 0)) {
      isPanningRef.current = true;
      previousMouseRef.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    } else if (event.button === 2 || event.ctrlKey || event.metaKey) {
      isDraggingRef.current = true;
      didDragRef.current = false;
      previousMouseRef.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  };

  const handleMouseMove = (event) => {
    if (isPanningRef.current) {
      const deltaX = event.clientX - previousMouseRef.current.x;
      const deltaY = event.clientY - previousMouseRef.current.y;
      
      const panSpeed = 0.5;
      const camera = cameraRef.current;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      
      camera.getWorldDirection(new THREE.Vector3());
      right.crossVectors(camera.up, camera.getWorldDirection(new THREE.Vector3())).normalize();
      up.copy(camera.up).normalize();
      
      cameraTargetRef.current.addScaledVector(right, -deltaX * panSpeed);
      cameraTargetRef.current.addScaledVector(up, deltaY * panSpeed);
      
      previousMouseRef.current = { x: event.clientX, y: event.clientY };
      updateCameraPosition();
    } else if (isDraggingRef.current) {
      const deltaX = event.clientX - previousMouseRef.current.x;
      const deltaY = event.clientY - previousMouseRef.current.y;
      
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        didDragRef.current = true;
      }
      
      cameraAngleRef.current.theta -= deltaX * 0.005;
      cameraAngleRef.current.phi -= deltaY * 0.005;
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngleRef.current.phi));
      
      previousMouseRef.current = { x: event.clientX, y: event.clientY };
      updateCameraPosition();
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
    setTimeout(() => {
      didDragRef.current = false;
    }, 100);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    cameraDistanceRef.current += event.deltaY * 0.3;
    cameraDistanceRef.current = Math.max(30, Math.min(2000, cameraDistanceRef.current));
    updateCameraPosition();
  };

  const handleClick = (event) => {
    if (!isSetupMode || didDragRef.current || event.button !== 0) return;
    
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    mouseRef.current.set(x, y);
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    
    raycasterRef.current.ray.intersectPlane(plane, intersectPoint);
    
    if (intersectPoint) {
      const gridX = Math.round(intersectPoint.x + gridSize / 2);
      const gridY = Math.round(intersectPoint.y + gridSize / 2);
      
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        gridRef.current[gridX][gridY] = gridRef.current[gridX][gridY] === 1 ? 0 : 1;
        updateSetupLayer();
      }
    }
  };

  const loadPattern = (patternKey) => {
    if (!isSetupMode || !patternKey) return;
    
    const pattern = patterns[patternKey];
    if (!pattern) return;
    
    console.log(`Loading pattern: ${pattern.name}`, pattern);
    
    gridRef.current = initializeGrid();
    
    const offsetX = Math.floor(gridSize / 2) - 20;
    const offsetY = Math.floor(gridSize / 2) - 20;
    
    pattern.cells.forEach(([x, y]) => {
      const gridX = x + offsetX;
      const gridY = y + offsetY;
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        gridRef.current[gridX][gridY] = 1;
      }
    });
    
    console.log(`Pattern loaded with ${pattern.cells.length} cells`);
    updateSetupLayer();
  };

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    highlightNewRef.current = highlightNew;
    if (!isSetupMode && cubesRef.current.length > 0) {
      updateCubeColors();
    }
  }, [highlightNew, isSetupMode]);

  useEffect(() => {
    cubeColorRef.current = cubeColor;
    if (!isSetupMode && cubesRef.current.length > 0) {
      updateCubeColors();
    }
  }, [cubeColor, isSetupMode]);

  useEffect(() => {
    lightPositionRef.current = lightPosition;
  }, [lightPosition]);

  useEffect(() => {
    lightIntensityRef.current = lightIntensity;
    // Update all light intensities
    if (pointLightRef.current) {
      pointLightRef.current.intensity = lightIntensity;
    }
    if (pointLight2Ref.current) {
      pointLight2Ref.current.intensity = lightIntensity * 0.67;
    }
    if (topLightRef.current) {
      topLightRef.current.intensity = lightIntensity * 0.33;
    }
  }, [lightIntensity]);

  useEffect(() => {
    if (isSetupMode && sceneRef.current) {
      updateSetupLayer();
    }
  }, [cubeColor, isSetupMode]);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      5000
    );
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    raycasterRef.current = new THREE.Raycaster();

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 800);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    const pointLight2 = new THREE.PointLight(0xffffff, 1.0, 600);
    pointLight2.position.set(0, 0, 20);
    scene.add(pointLight2);
    pointLight2Ref.current = pointLight2;

    const topLight = new THREE.PointLight(0xffffff, 0.5, 1000);
    topLight.position.set(0, 0, 50);
    scene.add(topLight);
    topLightRef.current = topLight;
    
    // Add a test cube at origin to verify scene is rendering
    const testGeometry = new THREE.BoxGeometry(10, 10, 10);
    const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // RED
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 0, 0);
    scene.add(testCube);
    console.log('Added red test cube at origin (0, 0, 0)');
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);
    console.log('Added grid helper');

    gridRef.current = initializeGrid();
    console.log('Scene initialized, grid created');
    
    // Load initial glider pattern
    const glider = patterns['glider'];
    if (glider) {
      const offsetX = Math.floor(gridSize / 2) - 20;
      const offsetY = Math.floor(gridSize / 2) - 20;
      glider.cells.forEach(([x, y]) => {
        const gridX = x + offsetX;
        const gridY = y + offsetY;
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
          gridRef.current[gridX][gridY] = 1;
        }
      });
      console.log('Initial glider pattern loaded');
    }
    
    updateSetupLayer();
    console.log('Initial setup layer created');

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const animate = (timestamp) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (isRunningRef.current && timestamp - lastUpdateRef.current > speedRef.current) {
        lastUpdateRef.current = timestamp;
        gridRef.current = updateGrid(gridRef.current);
        generationRef.current += 1;
        setGeneration(generationRef.current);
        
        if (highlightNewRef.current) {
          updateCubeColors();
        }
        
        addGenerationLayer(gridRef.current, generationRef.current);
        
        const targetZ = generationRef.current / 2;
        cameraTargetRef.current.z = targetZ;
        updateCameraPosition();
        
        if (pointLightRef.current) {
          const currentGen = generationRef.current;
          if (lightPositionRef.current === 'current') {
            pointLightRef.current.position.z = currentGen;
          } else if (lightPositionRef.current === 'center') {
            pointLightRef.current.position.z = currentGen / 2;
          } else if (lightPositionRef.current === 'top') {
            pointLightRef.current.position.z = currentGen + 10;
          }
        }
      }
      
      if (autoRotateRef.current) {
        cameraAngleRef.current.theta += 0.002;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };

    animate(0);

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      setupCubesRef.current.forEach(cube => {
        cube.geometry.dispose();
        cube.material.dispose();
        scene.remove(cube);
      });
      cubesRef.current.forEach(cube => {
        cube.geometry.dispose();
        cube.material.dispose();
        scene.remove(cube);
      });
      renderer.dispose();
    };
  }, []);

  const reset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setIsSetupMode(true);
    setGeneration(0);
    generationRef.current = 0;
    setSelectedPattern('');
    
    const scene = sceneRef.current;
    cubesRef.current.forEach(cube => {
      cube.geometry.dispose();
      cube.material.dispose();
      scene.remove(cube);
    });
    cubesRef.current = [];
    
    setupCubesRef.current.forEach(cube => {
      cube.geometry.dispose();
      cube.material.dispose();
      scene.remove(cube);
    });
    setupCubesRef.current.clear();
    
    gridRef.current = initializeGrid();
    updateSetupLayer();
    
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 4 };
    cameraDistanceRef.current = 150; // CLOSER - was 400
    cameraTargetRef.current.set(0, 0, 0);
    updateCameraPosition();
    
    if (pointLightRef.current) {
      pointLightRef.current.position.z = 0;
    }
  };

  const startGame = () => {
    setIsSetupMode(false);
    setIsRunning(true);
    isRunningRef.current = true;
    
    const scene = sceneRef.current;
    setupCubesRef.current.forEach(cube => {
      cube.geometry.dispose();
      cube.material.dispose();
      scene.remove(cube);
    });
    setupCubesRef.current.clear();
    
    addGenerationLayer(gridRef.current, 0);
  };

  const randomize = () => {
    if (!isSetupMode) return;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        gridRef.current[x][y] = Math.random() > 0.7 ? 1 : 0;
      }
    }
    updateSetupLayer();
  };

  const clear = () => {
    if (!isSetupMode) return;
    setSelectedPattern('');
    gridRef.current = initializeGrid();
    updateSetupLayer();
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">
          Conway's Game of Life: Strata Edition
        </h1>
        <p className="text-gray-300 text-sm mb-4">
          Each generation is preserved as a permanent layer, creating a complete history of cellular evolution.
        </p>
        
        {isSetupMode ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={startGame} className="px-4 py-2 rounded font-semibold bg-green-600 hover:bg-green-700 text-white text-sm">
                ▶ Start
              </button>
              
              <select
                value={selectedPattern}
                onChange={(e) => {
                  setSelectedPattern(e.target.value);
                  loadPattern(e.target.value);
                }}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-sm"
              >
                <option value="">-- Select Pattern ({Object.keys(patterns).length} available) --</option>
                <optgroup label="🚀 Spaceships">
                  {Object.entries(patterns).filter(([k]) => ['glider','lwss','mwss','hwss'].includes(k)).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </optgroup>
                <optgroup label="🔄 Oscillators">
                  {Object.entries(patterns).filter(([k]) => ['blinker','toad','beacon','clock','pulsar','pentadecathlon','figure8','koksgalaxy','queenbee','mold'].includes(k)).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </optgroup>
                <optgroup label="⬛ Still Lifes">
                  {Object.entries(patterns).filter(([k]) => ['block','beehive','loaf','boat','tub','ship','barge','pond'].includes(k)).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </optgroup>
                <optgroup label="⏳ Methuselahs">
                  {Object.entries(patterns).filter(([k]) => ['rpentomino','diehard','acorn','bheptomino','piheptomino','thunderbird'].includes(k)).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </optgroup>
                <optgroup label="🎯 Special">
                  {Object.entries(patterns).filter(([k]) => ['gosperGliderGun','eater1','switch','burninship','barberpole'].includes(k)).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </optgroup>
              </select>
              
              <button onClick={randomize} className="px-4 py-2 rounded font-semibold bg-purple-600 hover:bg-purple-700 text-white text-sm">
                🎲 Random
              </button>
              
              <button onClick={clear} className="px-4 py-2 rounded font-semibold bg-red-600 hover:bg-red-700 text-white text-sm">
                ✖ Clear
              </button>
            </div>
            
            {selectedPattern && patterns[selectedPattern] && (
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-yellow-400 text-sm font-semibold">
                  📌 {patterns[selectedPattern].name}
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Creator: {patterns[selectedPattern].creator} ({patterns[selectedPattern].year})
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 items-center">
              <label className="flex items-center gap-2 text-white cursor-pointer bg-blue-600 px-4 py-2 rounded font-semibold">
                <input
                  type="checkbox"
                  checked={highlightNew}
                  onChange={(e) => setHighlightNew(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>💡 Highlight Newest Layer (Blue)</span>
              </label>
              
              <select value={cubeColor} onChange={(e) => setCubeColor(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white text-sm">
                <option value="white">⚪ White</option>
                <option value="blue">🔵 Blue</option>
                <option value="rainbow">🌈 Rainbow</option>
                <option value="fade">🎨 Fade</option>
              </select>
              
              <select value={lightPosition} onChange={(e) => setLightPosition(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white text-sm">
                <option value="current">💡 Light: Follow Current</option>
                <option value="center">💡 Light: Center</option>
                <option value="top">💡 Light: Above Top</option>
              </select>
              
              <div className="flex items-center gap-2">
                <label className="text-white font-semibold text-sm">💡 Brightness:</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-white text-xs">{lightIntensity.toFixed(1)}x</span>
              </div>
              
              <div className="flex gap-1">
                <button onClick={() => setView('top')} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Top</button>
                <button onClick={() => setView('front')} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Front</button>
                <button onClick={() => setView('left')} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Left</button>
                <button onClick={() => setView('right')} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Right</button>
                <button onClick={() => setView('free')} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Free</button>
              </div>
            </div>
            
            <p className="text-cyan-400 text-xs">
              🖱️ Left-click: place • Right-drag: rotate • Shift-drag: pan • Scroll: zoom (500×500 grid)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => { setIsRunning(!isRunning); isRunningRef.current = !isRunning; }}
                className={`px-4 py-2 rounded font-semibold ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white text-sm`}
              >
                {isRunning ? '⏸ Pause' : '▶ Resume'}
              </button>
              
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-4 py-2 rounded font-semibold ${autoRotate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white text-sm`}
              >
                {autoRotate ? '🔄 Auto-Rotate ON' : '🔄 Auto-Rotate OFF'}
              </button>
              
              <button onClick={reset} className="px-4 py-2 rounded font-semibold bg-orange-600 hover:bg-orange-700 text-white text-sm">
                🔄 Reset
              </button>
              
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-white text-sm">{speed}ms</span>
              
              <span className="text-white text-sm font-bold">Gen: <span className="text-cyan-400">{generation}</span></span>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <label className="flex items-center gap-2 text-white cursor-pointer bg-blue-600 px-4 py-2 rounded font-semibold">
                <input
                  type="checkbox"
                  checked={highlightNew}
                  onChange={(e) => setHighlightNew(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>💡 Highlight Newest Layer</span>
              </label>
              
              <select value={cubeColor} onChange={(e) => setCubeColor(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white text-sm">
                <option value="white">⚪ White</option>
                <option value="blue">🔵 Blue</option>
                <option value="rainbow">🌈 Rainbow</option>
                <option value="fade">🎨 Fade</option>
              </select>
              
              <select value={lightPosition} onChange={(e) => setLightPosition(e.target.value)} className="px-3 py-2 rounded bg-gray-700 text-white text-sm">
                <option value="current">💡 Light: Follow Current</option>
                <option value="center">💡 Light: Center</option>
                <option value="top">💡 Light: Above Top</option>
              </select>
              
              <div className="flex items-center gap-2">
                <label className="text-white font-semibold text-sm">💡 Brightness:</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-white text-xs">{lightIntensity.toFixed(1)}x</span>
              </div>
              
              <div className="flex gap-1">
                <button onClick={() => setView('top')} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Top</button>
                <button onClick={() => setView('front')} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Front</button>
                <button onClick={() => setView('left')} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Left</button>
                <button onClick={() => setView('right')} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Right</button>
                <button onClick={() => setView('free')} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs">Free</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div ref={mountRef} className="flex-1" />
      
      <div className="bg-gray-900 px-4 py-2 border-t border-gray-700 text-center">
        <p className="text-gray-400 text-xs">
          Conway's Game of Life: Strata Edition • {Object.keys(patterns).length}+ patterns with creators • Built with Claude AI
        </p>
      </div>
    </div>
  );
}
