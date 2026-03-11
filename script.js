// ===========================
// Three.js Scene Setup
// ===========================

let scene, camera, renderer, particles, particleGeometry, particlesMaterial;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let tube, tubeSegments = [];
let scrollTubeGroup;

function initThree() {
    const canvas = document.getElementById('webgl');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.003);  // Black fog
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Particles
    createParticles();
    
    // Create scrolling tube
    createScrollingTube();
    
    // Geometric shapes
    createGeometricShapes();
    
    // Lights - white/neutral theme
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);  // White
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);
    
    // Add lights inside the tube - white/gray theme
    const tubeLight1 = new THREE.PointLight(0xffffff, 2, 60);  // White
    tubeLight1.position.set(0, 0, -20);
    scene.add(tubeLight1);
    
    const tubeLight2 = new THREE.PointLight(0xcccccc, 2, 60);  // Light gray
    tubeLight2.position.set(0, 0, -60);
    scene.add(tubeLight2);
    
    // Add directional light for better depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);  // White
    directionalLight.position.set(0, 10, 50);
    scene.add(directionalLight);
    
    window.tubeLights = [tubeLight1, tubeLight2];
    
    // Animation loop
    animate();
}

function createParticles() {
    particleGeometry = new THREE.BufferGeometry();
    const particleCount = 800;  // Moderate amount
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;
        
        // White to light gray particles
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
            // White (255, 255, 255)
            colors[i] = 1.0;
            colors[i + 1] = 1.0;
            colors[i + 2] = 1.0;
        } else {
            // Light gray (200, 200, 200)
            colors[i] = 0.78;
            colors[i + 1] = 0.78;
            colors[i + 2] = 0.78;
        }
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    particlesMaterial = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(particleGeometry, particlesMaterial);
    scene.add(particles);
}

function createScrollingTube() {
    scrollTubeGroup = new THREE.Group();
    
    // Create multiple tube segments for infinite scroll effect
    const segmentCount = 10;  // Reduced for less clutter
    const segmentLength = 30;
    
    for (let i = 0; i < segmentCount; i++) {
        // Create tube curve - a straight path with slight curves
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(
                Math.sin(i * 0.5) * 1, 
                Math.cos(i * 0.3) * 1, 
                -segmentLength
            )
        ]);
        
        // Create tube geometry
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            64,  // tubular segments
            8,   // radius
            32,  // radial segments - increased for smoother solid surface
            false // closed
        );
        
        // Create solid material with gray/white theme
        const tubeMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,  // Dark gray
            wireframe: false,  // Solid tube
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            emissive: 0x333333,  // Dark gray glow
            emissiveIntensity: 0.2,
            shininess: 120,
            specular: 0x666666  // Gray specular highlight
        });
        
        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tubeMesh.position.z = -i * segmentLength;
        
        scrollTubeGroup.add(tubeMesh);
        tubeSegments.push({
            mesh: tubeMesh,
            initialZ: tubeMesh.position.z,
            material: tubeMaterial
        });
        
        // Add ring markers along the tube
        if (i % 3 === 0) {
            const ringGeometry = new THREE.TorusGeometry(8.2, 0.3, 16, 32);
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,  // White
                transparent: true,
                opacity: 0.4,
                emissive: 0x888888,  // Gray emissive
                emissiveIntensity: 0.4
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.z = -i * segmentLength - segmentLength / 2;
            scrollTubeGroup.add(ring);
            tubeSegments.push({
                mesh: ring,
                initialZ: ring.position.z,
                material: ringMaterial
            });
        }
    }
    
    // No particles inside the tube - removed for cleaner look
    
    scrollTubeGroup.position.z = -100;
    scene.add(scrollTubeGroup);
}

function createGeometricShapes() {
    // Rotating torus - white/gray theme
    const torusGeometry = new THREE.TorusGeometry(10, 2, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,  // White
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-30, 20, -20);
    scene.add(torus);
    torus.userData.rotationSpeed = { x: 0.005, y: 0.01 };
    
    // Icosahedron - white/gray theme
    const icoGeometry = new THREE.IcosahedronGeometry(8, 0);
    const icoMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,  // Light gray
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    icosahedron.position.set(30, -20, -30);
    scene.add(icosahedron);
    icosahedron.userData.rotationSpeed = { x: 0.01, y: 0.005 };
    
    // Octahedron - white/gray theme
    const octaGeometry = new THREE.OctahedronGeometry(6);
    const octaMaterial = new THREE.MeshPhongMaterial({
        color: 0x999999,  // Medium gray
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    octahedron.position.set(0, 30, -40);
    scene.add(octahedron);
    octahedron.userData.rotationSpeed = { x: 0.008, y: 0.012 };
    
    // Store shapes for animation
    window.geometricShapes = [torus, icosahedron, octahedron];
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Rotate particles
    if (particles) {
        particles.rotation.x += 0.0001;
        particles.rotation.y += 0.0002;
        
        // Wave effect
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i] * 0.01) * 0.01;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate tube segments (more subtle)
    if (tubeSegments.length > 0) {
        tubeSegments.forEach((segment, index) => {
            // Rotate tubes slowly
            segment.mesh.rotation.z += 0.0005;  // Slower rotation
            
            // Very subtle pulse effect on materials
            if (segment.material.opacity) {
                segment.material.opacity = 0.1 + Math.sin(time * 1 + index * 0.5) * 0.05;  // Minimal pulse
            }
        });
    }
    
    // Animate tube lights (smooth purple/pink pulse)
    if (window.tubeLights) {
        window.tubeLights.forEach((light, index) => {
            light.intensity = 2 + Math.sin(time * 1 + index * Math.PI) * 0.5;
            light.position.z = -20 - Math.sin(time * 0.5 + index) * 20;
        });
    }
    
    // Rotate geometric shapes
    if (window.geometricShapes) {
        window.geometricShapes.forEach(shape => {
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
        });
    }
    
    // Camera follows mouse with smooth interpolation
    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// ===========================
// Custom Cursor
// ===========================

const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
    
    // Update Three.js mouse position
    mouseX = (e.clientX - windowHalfX);
    mouseY = (e.clientY - windowHalfY);
});

// Cursor hover effects
document.querySelectorAll('a, button, .project-card').forEach(elem => {
    elem.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    
    elem.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
    });
});

// ===========================
// Loading Screen
// ===========================

window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    const loadingPercentage = document.querySelector('.loading-percentage');
    
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                // Initialize animations after loading
                initScrollAnimations();
            }, 500);
        }
        
        loadingProgress.style.width = progress + '%';
        loadingPercentage.textContent = Math.floor(progress) + '%';
    }, 200);
});

// ===========================
// Navigation
// ===========================

const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

// Scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// GSAP Scroll Animations
// ===========================

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero animations
    gsap.from('.hero-title .word', {
        duration: 1.2,
        y: 100,
        opacity: 0,
        stagger: 0.2,
        ease: 'power4.out'
    });
    
    gsap.from('.hero-subtitle', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.5,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-name', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.7,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-cta .cta-button', {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        delay: 0.9,
        ease: 'power3.out'
    });
    
    gsap.from('.scroll-indicator', {
        duration: 1,
        opacity: 0,
        delay: 1.5,
        ease: 'power3.out'
    });
    
    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out'
        });
    });
    
    // About section
    gsap.from('.about-intro', {
        scrollTrigger: {
            trigger: '.about-intro',
            start: 'top 80%'
        },
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    });
    
    gsap.from('.stat-item', {
        scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 80%'
        },
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out',
        onComplete: animateStats
    });
    
    gsap.from('.detail-item', {
        scrollTrigger: {
            trigger: '.about-details',
            start: 'top 80%'
        },
        duration: 1,
        x: -50,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out'
    });
    
    gsap.from('.visual-card', {
        scrollTrigger: {
            trigger: '.visual-card',
            start: 'top 80%'
        },
        duration: 1.5,
        scale: 0.8,
        opacity: 0,
        rotation: 10,
        ease: 'power3.out'
    });
    
    // Tech Stack section - animate categories with enhanced effects
    gsap.utils.toArray('.tech-category').forEach((category, index) => {
        // Category entrance
        gsap.from(category, {
            scrollTrigger: {
                trigger: category,
                start: 'top 80%',
                once: true
            },
            duration: 0.8,
            y: 60,
            opacity: 0,
            scale: 0.9,
            rotationX: -10,
            delay: index * 0.15,
            ease: 'power3.out'
        });
        
        // Icon animation
        const icon = category.querySelector('.tech-category-icon');
        gsap.from(icon, {
            scrollTrigger: {
                trigger: category,
                start: 'top 75%',
                once: true
            },
            duration: 1,
            scale: 0,
            rotation: 360,
            delay: index * 0.15 + 0.2,
            ease: 'back.out(1.7)'
        });
        
        // Animate tech badges with stagger
        const badges = category.querySelectorAll('.tech-badge');
        gsap.from(badges, {
            scrollTrigger: {
                trigger: category,
                start: 'top 75%',
                once: true
            },
            duration: 0.6,
            y: 20,
            opacity: 0,
            scale: 0.8,
            stagger: 0.03,
            delay: index * 0.15 + 0.4,
            ease: 'back.out(1.7)'
        });
    });
    
    // Projects section
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%'
            },
            duration: 1,
            y: 100,
            opacity: 0,
            rotation: index % 2 === 0 ? 5 : -5,
            ease: 'power3.out'
        });
    });
    
    // Contact section
    gsap.from('.contact-info', {
        scrollTrigger: {
            trigger: '.contact-content',
            start: 'top 80%'
        },
        duration: 1,
        x: -50,
        opacity: 0,
        ease: 'power3.out'
    });
    
    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact-content',
            start: 'top 80%'
        },
        duration: 1,
        x: 50,
        opacity: 0,
        ease: 'power3.out'
    });
    
    gsap.from('.contact-item', {
        scrollTrigger: {
            trigger: '.contact-details',
            start: 'top 80%'
        },
        duration: 0.8,
        x: -30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out'
    });
    
    gsap.from('.social-link', {
        scrollTrigger: {
            trigger: '.social-links',
            start: 'top 85%'
        },
        duration: 0.8,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out'
    });
    
    gsap.from('.form-group', {
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%'
        },
        duration: 0.8,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out'
    });
}

// Animate statistics numbers
function animateStats() {
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current) + '+';
        }, 30);
    });
}

// ===========================
// Contact Form
// ===========================

// Removed old contact form handler - now using Formspree integration below

// ===========================
// Parallax Effect & Tube Scrolling
// ===========================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrolled / maxScroll;
    
    // Parallax for hero section
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 500;
    }
    
    // Animate tube based on scroll (more subtle)
    if (scrollTubeGroup) {
        // Move tube forward as you scroll down (slower)
        const tubeSpeed = 100; // Slower, less aggressive
        scrollTubeGroup.position.z = -100 + (scrollProgress * tubeSpeed);
        
        // Minimal rotation
        scrollTubeGroup.rotation.z = scrollProgress * Math.PI * 0.5;  // Much less rotation
    }
    
    // Move tube segments to create infinite tunnel effect
    if (tubeSegments.length > 0) {
        const segmentLength = 30;
        const totalLength = segmentLength * 10;  // Adjusted for fewer segments
        
        tubeSegments.forEach((segment) => {
            // Move segments based on scroll
            const newZ = segment.initialZ + (scrollProgress * totalLength);
            
            // Reset segments that went too far forward
            if (newZ > 50) {
                segment.mesh.position.z = newZ - totalLength * 2;
            } else if (newZ < -totalLength - 50) {
                segment.mesh.position.z = newZ + totalLength * 2;
            } else {
                segment.mesh.position.z = newZ;
            }
            
            // Keep colors consistent - purple/indigo theme
            if (segment.material.emissive) {
                segment.material.emissive.setRGB(0.39, 0.4, 0.95);  // Indigo
                segment.material.emissiveIntensity = 0.2 + Math.sin(scrollProgress * Math.PI * 2) * 0.1;
            }
        });
    }
    
    // Move camera through the tube (less aggressive)
    if (camera) {
        camera.position.z = 50 + (scrollProgress * -80);  // Less camera movement
        
        // Minimal camera rotation
        camera.rotation.z = Math.sin(scrollProgress * Math.PI * 2) * 0.005;  // Very subtle
    }
    
    // Parallax for geometric shapes in Three.js
    if (window.geometricShapes) {
        window.geometricShapes.forEach((shape, index) => {
            shape.position.y = Math.sin(scrolled * 0.001 + index) * 5;
            shape.position.z = -20 + scrollProgress * -100 + index * -10;
        });
    }
});

// ===========================
// Window Resize Handler
// ===========================

window.addEventListener('resize', () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// ===========================
// Initialize Everything
// ===========================

// Initialize Three.js scene
initThree();

// Add hover effect to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// Glitch effect on hover for hero title
const heroTitle = document.querySelector('.hero-title');
let glitchInterval;

heroTitle.addEventListener('mouseenter', () => {
    let counter = 0;
    glitchInterval = setInterval(() => {
        if (counter > 5) {
            clearInterval(glitchInterval);
            heroTitle.style.transform = '';
            return;
        }
        
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        heroTitle.style.transform = `translate(${x}px, ${y}px)`;
        counter++;
    }, 50);
});

// Add magnetic effect to buttons
document.querySelectorAll('.cta-button, .submit-button').forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = '';
    });
});

// ===========================
// Contact Form Handler - Simple Mailto
// ===========================

// Initialize EmailJS with your Public Key
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
})();

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading message
        formStatus.style.display = 'block';
        formStatus.style.color = '#4ade80';
        formStatus.textContent = '⏳ Sending message...';
        
        // Get form data
        const templateParams = {
            from_name: document.getElementById('name').value,
            from_email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            to_email: 'keshavyadav2005562@gmail.com'
        };
        
        // Send email using EmailJS
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                formStatus.style.color = '#4ade80';
                formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
                contactForm.reset();
                
                // Hide status after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }, function(error) {
                console.log('FAILED...', error);
                formStatus.style.color = '#ef4444';
                formStatus.textContent = '✗ Failed to send message. Please try again or email directly.';
                
                // Hide status after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            });
    });
}

// Console message
console.log('%c🚀 Portfolio Loaded Successfully! ', 'background: linear-gradient(135deg, #00f0ff, #ff00ff); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%cDesigned & Developed by Keshav Yadav', 'color: #00f0ff; font-size: 14px;');
