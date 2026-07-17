// ====== THEME MANAGEMENT ======
        let isDark = false;
        function toggleDark() {
            isDark = !isDark;
            document.documentElement.classList.toggle('dark', isDark);
            document.getElementById('sunIcon').classList.toggle('hidden', !isDark);
            document.getElementById('moonIcon').classList.toggle('hidden', isDark);
            saveToStorage();
        }

        // ====== PRINT HANDLERS ======
        window.addEventListener('beforeprint', () => {
            // Strip transition-transform class to prevent Chrome from creating GPU layers
            const paper = document.getElementById('biodataPaper');
            if (paper) {
                paper.classList.remove('transition-transform');
                paper.style.transform = 'none';
                paper.style.webkitTransform = 'none';
            }
            // Strip overflow:hidden from container
            const container = document.getElementById('previewContainer');
            if (container) container.style.overflow = 'visible';

            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                document.documentElement.dataset.wasDark = 'true';
            }
        });
        window.addEventListener('afterprint', () => {
            // Restore transition-transform class
            const paper = document.getElementById('biodataPaper');
            if (paper) {
                paper.classList.add('transition-transform');
                paper.style.transform = '';
                paper.style.webkitTransform = '';
            }
            const container = document.getElementById('previewContainer');
            if (container) container.style.overflow = '';

            if (document.documentElement.dataset.wasDark === 'true') {
                document.documentElement.classList.add('dark');
                document.documentElement.dataset.wasDark = 'false';
            }
        });
        function setAccent(color, light, dark) {
            document.documentElement.style.setProperty('--accent', color);
            document.documentElement.style.setProperty('--accent-light', light);
            document.documentElement.style.setProperty('--accent-dark', dark);
            // Highlight selected swatch
            document.querySelectorAll('.accent-bg').forEach(el => {
                if (el.closest('#formView')) el.style.backgroundColor = color;
            });
            saveToStorage();
        }
        function setCustomAccent(hex) {
            // hex is something like #ff0000
            // We can create a light version by appending '1A' for ~10% opacity, or '26' for ~15%
            let light = hex + '20'; 
            let dark = hex; // We use the same for dark, it works well enough as a fallback
            setAccent(hex, light, dark);
        }

        // ====== WYSIWYG SECTION STYLING ======
        let sectionStyles = {};
        let activeEditSection = null;

        const defaultStyles = { bg: '#ffffff', heading: '#000000', text: '#000000' };

        function openStyleEditor(sectionId) {
            activeEditSection = sectionId;
            const styles = sectionStyles[sectionId] || { ...defaultStyles };
            
            // Set inputs
            document.getElementById('se-bg-color').value = styles.bg;
            document.getElementById('se-bg-ind').style.backgroundColor = styles.bg;
            
            document.getElementById('se-heading-color').value = styles.heading;
            document.getElementById('se-heading-ind').style.backgroundColor = styles.heading;
            
            document.getElementById('se-text-color').value = styles.text;
            document.getElementById('se-text-ind').style.backgroundColor = styles.text;
            
            // Set title
            const names = {
                'objective': 'Career Objective', 'edu': 'Education', 'exp': 'Experience', 'certs': 'Certifications',
                'projects': 'Projects', 'personal': 'Personal Details', 'address': 'Address',
                'skills': 'Skills', 'hobbies': 'Hobbies', 'ref': 'References'
            };
            document.getElementById('styleEditorTitle').innerText = names[sectionId] || 'Section';
            
            // Show modal
            const modal = document.getElementById('styleEditorModal');
            const content = document.getElementById('styleEditorContent');
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeStyleEditor() {
            const modal = document.getElementById('styleEditorModal');
            const content = document.getElementById('styleEditorContent');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                activeEditSection = null;
            }, 300);
        }

        function liveUpdateStyleEditor() {
            const bg = document.getElementById('se-bg-color').value;
            const heading = document.getElementById('se-heading-color').value;
            const text = document.getElementById('se-text-color').value;
            
            document.getElementById('se-bg-ind').style.backgroundColor = bg;
            document.getElementById('se-heading-ind').style.backgroundColor = heading;
            document.getElementById('se-text-ind').style.backgroundColor = text;
            
            if(activeEditSection) {
                applyStylesToElement(activeEditSection, { bg, heading, text });
            }
        }

        function saveStyleEditor() {
            if(!activeEditSection) return;
            const bg = document.getElementById('se-bg-color').value;
            const heading = document.getElementById('se-heading-color').value;
            const text = document.getElementById('se-text-color').value;
            
            sectionStyles[activeEditSection] = { bg, heading, text };
            saveToStorage();
            closeStyleEditor();
        }

        function resetStyleEditor() {
            if(!activeEditSection) return;
            delete sectionStyles[activeEditSection];
            applyStylesToElement(activeEditSection, defaultStyles);
            saveToStorage();
            closeStyleEditor();
        }

        function applyStylesToElement(sec, styles) {
            const el = document.getElementById(`out-${sec}-section`);
            if (el) {
                if (styles.bg && styles.bg !== '#ffffff') {
                    el.style.backgroundColor = styles.bg;
                    el.classList.add('p-4', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-100', 'dark:border-gray-700');
                } else {
                    el.style.backgroundColor = 'transparent';
                    el.classList.remove('p-4', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-100', 'dark:border-gray-700');
                }
                
                // Heading
                const headingEl = el.querySelector('.style-target-heading');
                if (headingEl) {
                    if(styles.heading && styles.heading !== '#000000') {
                        headingEl.style.color = styles.heading;
                        headingEl.classList.remove('accent-text'); 
                    } else {
                        headingEl.style.color = '';
                        headingEl.classList.add('accent-text');
                    }
                }
                
                // Text
                const textEl = el.querySelector('.style-target-text');
                if (textEl) {
                    if(styles.text && (styles.text !== '#000000' && styles.text !== '#374151')) {
                        textEl.style.color = styles.text;
                    } else {
                        textEl.style.color = '';
                    }
                }
            }
        }

        function applySectionStyles() {
            const sections = ['objective', 'edu', 'exp', 'certs', 'projects', 'personal', 'address', 'skills', 'hobbies', 'ref'];
            sections.forEach(sec => {
                const styles = sectionStyles[sec] || defaultStyles;
                applyStylesToElement(sec, styles);
            });
        }

        function setFont(font) {
            document.documentElement.style.setProperty('--font-family', font);
            saveToStorage();
        }

        // ====== IMAGE UPLOAD & CROP ======
        let photoDataUrl = null, sigDataUrl = null, cropper = null, cropTarget = null;
        function previewImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                document.getElementById('photoError').classList.add('show');
                event.target.value = '';
                return;
            }
            document.getElementById('photoError').classList.remove('show');
            cropTarget = 'photo';
            document.getElementById('cropModalTitle').innerText = 'Crop Profile Photo';
            const reader = new FileReader();
            reader.onload = e => {
                document.getElementById('cropImage').src = e.target.result;
                document.getElementById('cropModal').classList.remove('hidden');
                
                if (cropper) cropper.destroy();
                cropper = new Cropper(document.getElementById('cropImage'), {
                    aspectRatio: 90 / 115, // matches biodata profile image ratio
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                });
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }

        function cancelCrop() {
            document.getElementById('cropModal').classList.add('hidden');
            if (cropper) cropper.destroy();
            cropper = null;
            cropTarget = null;
        }

        function saveCrop() {
            if (!cropper) return;
            if (cropTarget === 'photo') {
                const canvas = cropper.getCroppedCanvas({ width: 360, height: 460, fillColor: '#fff' });
                photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                document.getElementById('imagePreview').src = photoDataUrl;
                document.getElementById('imagePreview').classList.remove('hidden');
                document.getElementById('imagePlaceholder').classList.add('hidden');
            } else if (cropTarget === 'signature') {
                const canvas = cropper.getCroppedCanvas({ fillColor: '#fff' });
                sigDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                document.getElementById('sigPreview').src = sigDataUrl;
                document.getElementById('sigPreview').classList.remove('hidden');
            }
            saveToStorage();
            cancelCrop();
        }
        function previewSignature(event) {
            const file = event.target.files[0];
            if (!file) return;
            cropTarget = 'signature';
            document.getElementById('cropModalTitle').innerText = 'Crop Signature';
            const reader = new FileReader();
            reader.onload = e => {
                document.getElementById('cropImage').src = e.target.result;
                document.getElementById('cropModal').classList.remove('hidden');
                
                if (cropper) cropper.destroy();
                cropper = new Cropper(document.getElementById('cropImage'), {
                    aspectRatio: NaN, // Freeform aspect ratio for signatures
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                });
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }

        // ====== SKILLS SUGGESTIONS DATABASE ======
        const SKILL_DB = {
            tech: ['JavaScript','Python','Java','C++','HTML/CSS','React','Node.js','SQL','MongoDB','Git','Docker','AWS','TypeScript','PHP','Flutter','Kotlin','Swift','REST APIs','Linux','Machine Learning'],
            soft: ['Communication','Leadership','Teamwork','Problem Solving','Time Management','Critical Thinking','Adaptability','Creativity','Public Speaking','Decision Making','Conflict Resolution','Negotiation','Emotional Intelligence','Work Ethic','Attention to Detail'],
            office: ['MS Word','MS Excel','MS PowerPoint','Google Sheets','Google Docs','Data Entry','Typing Speed','Tally','SAP','CRM Software','Email Management','File Management'],
            language: ['English','Hindi','Bengali','Tamil','Telugu','Marathi','Gujarati','Kannada','Malayalam','Urdu','Punjabi','Spanish','French','German','Japanese'],
            design: ['Photoshop','Illustrator','Figma','Canva','UI/UX Design','Video Editing','Premiere Pro','After Effects','CorelDRAW','Blender','Photography','Graphic Design']
        };
        const ALL_SKILLS = [...new Set(Object.values(SKILL_DB).flat())];

        // ====== SKILLS TAGS ======
        let skillsArray = [];
        const skillInput = document.getElementById('skillInput');
        const suggestionsBox = document.getElementById('skillSuggestions');

        skillInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = this.value.trim().replace(/,/g, '');
                if (val && skillsArray.length < 15 && !skillsArray.includes(val)) {
                    skillsArray.push(val);
                    renderSkillsForm();
                    this.value = '';
                    saveToStorage();
                }
                hideSuggestions();
            }
            if (e.key === 'Escape') hideSuggestions();
        });

        function showSkillSuggestions(query) {
            if (!query || query.trim().length < 1) { hideSuggestions(); return; }
            const q = query.toLowerCase();
            const matches = ALL_SKILLS.filter(s => s.toLowerCase().includes(q) && !skillsArray.includes(s)).slice(0, 8);
            if (matches.length === 0) { hideSuggestions(); return; }
            suggestionsBox.innerHTML = '';
            matches.forEach(s => {
                const div = document.createElement('div');
                div.className = 'suggestion-item px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700';
                // Highlight matched part
                const idx = s.toLowerCase().indexOf(q);
                div.innerHTML = s.substring(0,idx) + '<span class="font-bold accent-text">' + s.substring(idx, idx+q.length) + '</span>' + s.substring(idx+q.length);
                div.onclick = () => {
                    if (skillsArray.length < 15 && !skillsArray.includes(s)) {
                        skillsArray.push(s);
                        renderSkillsForm();
                        skillInput.value = '';
                        saveToStorage();
                    }
                    hideSuggestions();
                };
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.classList.remove('hidden');
        }

        function hideSuggestions() { suggestionsBox.classList.add('hidden'); }
        document.addEventListener('click', e => { if (!e.target.closest('#skillInput') && !e.target.closest('#skillSuggestions')) hideSuggestions(); });

        function addCategorySkills(cat) {
            const catSkills = SKILL_DB[cat] || [];
            let added = 0;
            catSkills.forEach(s => {
                if (skillsArray.length < 15 && !skillsArray.includes(s)) { skillsArray.push(s); added++; }
            });
            if (added > 0) { renderSkillsForm(); saveToStorage(); }
        }

        function removeSkill(i) { skillsArray.splice(i, 1); renderSkillsForm(); saveToStorage(); }
        function renderSkillsForm() {
            const c = document.getElementById('skillsContainer');
            c.innerHTML = '';
            skillsArray.forEach((s, i) => {
                const el = document.createElement('div');
                el.className = 'px-3 py-1 accent-bg text-white text-sm font-semibold rounded-full flex items-center gap-2';
                el.innerHTML = `${s} <button type="button" onclick="removeSkill(${i})" class="text-white/70 hover:text-white text-lg leading-none">&times;</button>`;
                c.appendChild(el);
            });
        }

        // ====== ADD HOBBY (Quick Add) ======
        function addHobby(hobby) {
            const el = document.getElementById('in-hobbies');
            const val = el.value.trim();
            if (val) {
                if (!val.includes(hobby)) el.value = val + ', ' + hobby;
            } else {
                el.value = hobby;
            }
            saveToStorage();
        }

        function toggleMoreHobbies() {
            const more = document.getElementById('more-hobbies');
            const btn = document.getElementById('btn-more-hobbies');
            if (more.classList.contains('hidden')) {
                more.classList.remove('hidden');
                btn.innerText = 'Less...';
            } else {
                more.classList.add('hidden');
                btn.innerText = 'More...';
            }
        }


        // ====== DYNAMIC ENTRIES ======
        let eduCount = 0; let expCount = 0; let refCount = 0; let langCount = 0;
        
        function escapeAttr(str) {
            if (!str) return '';
            return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function addLanguage(data = {}) {
            langCount++;
            const id = `lang-${langCount}`;
            const div = document.createElement('div');
            div.className = "flex gap-2 items-center";
            div.id = id;
            div.innerHTML = `
                <input type="text" class="lang-name form-input flex-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none dark:text-white text-sm" placeholder="e.g. English" value="${escapeAttr(data.name)}" oninput="saveToStorage()">
                <select class="lang-prof form-input w-1/3 sm:w-1/4 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none dark:text-white text-sm" onchange="saveToStorage()">
                    <option value="" disabled ${!data.prof ? 'selected' : ''}>Proficiency...</option>
                    <option value="Native" ${data.prof === 'Native' ? 'selected' : ''}>Native</option>
                    <option value="Fluent" ${data.prof === 'Fluent' ? 'selected' : ''}>Fluent</option>
                    <option value="Conversational" ${data.prof === 'Conversational' ? 'selected' : ''}>Conversational</option>
                    <option value="Basic" ${data.prof === 'Basic' ? 'selected' : ''}>Basic</option>
                </select>
                <button type="button" onclick="document.getElementById('${id}').remove(); saveToStorage()" class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg font-bold text-lg leading-none">&times;</button>
            `;
            document.getElementById('langContainer').appendChild(div);
        }

        function addEducation(data = {}) {
            eduCount++;
            const id = eduCount;
            const html = `
            <div id="edu-${id}" class="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl relative transition-theme">
                <button type="button" onclick="document.getElementById('edu-${id}').remove(); saveToStorage();" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl leading-none">&times;</button>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Qualification</label><input type="text" class="edu-qual form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.qual)}" placeholder="e.g. Class XII (Arts)" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Board / University</label><input type="text" class="edu-board form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.board)}" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Year</label><input type="text" class="edu-year form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.year)}" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Marks / Percentage</label><input type="text" class="edu-marks form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.marks)}" placeholder="e.g. 80% or 8.5 CGPA" oninput="saveToStorage()"></div>
                    <div class="sm:col-span-2"><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Subjects</label><input type="text" class="edu-subjects form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.subjects)}" oninput="saveToStorage()"></div>
                </div>
            </div>`;
            document.getElementById('eduContainer').insertAdjacentHTML('beforeend', html);
        }

        function addExperience(data = {}) {
            expCount++;
            const id = expCount;
            const html = `
            <div id="exp-${id}" class="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl relative transition-theme">
                <button type="button" onclick="document.getElementById('exp-${id}').remove(); saveToStorage();" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl leading-none">&times;</button>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Job Title</label><input type="text" class="exp-title form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.title)}" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Company</label><input type="text" class="exp-company form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.company)}" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Duration</label><input type="text" class="exp-duration form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.duration)}" placeholder="e.g. Jan 2022 - Present" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Description</label><input type="text" class="exp-desc form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.desc)}" oninput="saveToStorage()"></div>
                </div>
            </div>`;
            document.getElementById('expContainer').insertAdjacentHTML('beforeend', html);
        }

        function addReference(data = {}) {
            if (refCount >= 2) return;
            refCount++;
            const id = refCount;
            const html = `
            <div id="ref-${id}" class="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl relative transition-theme">
                <button type="button" onclick="document.getElementById('ref-${id}').remove(); refCount--; saveToStorage();" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl leading-none">&times;</button>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Name</label><input type="text" class="ref-name form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.name)}" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Designation</label><input type="text" class="ref-desg form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.desg)}" oninput="saveToStorage()"></div>
                    <div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Contact</label><input type="text" class="ref-contact form-input w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white" value="${escapeAttr(data.contact)}" oninput="saveToStorage()"></div>
                </div>
            </div>`;
            document.getElementById('refContainer').insertAdjacentHTML('beforeend', html);
        }

        // ====== VALIDATION ======
        function validateMobile(el) {
            const valid = /^\d{10,}$/.test(el.value.replace(/\D/g, ''));
            el.classList.toggle('input-error', el.value.length > 0 && !valid);
            document.getElementById('mobileError').classList.toggle('show', el.value.length > 0 && !valid);
        }
        function validateEmail(el) {
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
            el.classList.toggle('input-error', el.value.length > 0 && !valid);
            document.getElementById('emailError').classList.toggle('show', el.value.length > 0 && !valid);
        }

        // ====== LOCALSTORAGE ======
        function saveToStorage() {
            const data = {};
            document.querySelectorAll('.form-input').forEach(el => { 
                if (el.id) data[el.id] = el.type === 'checkbox' ? el.checked : el.value; 
            });
            data.skills = skillsArray;
            const langEntries = [];
            document.querySelectorAll('#langContainer > div').forEach(d => {
                langEntries.push({ name: d.querySelector('.lang-name').value, prof: d.querySelector('.lang-prof').value });
            });
            data.langEntries = langEntries;

            data.photoDataUrl = photoDataUrl;
            data.sigDataUrl = sigDataUrl;
            data.isDark = isDark;
            data.font = document.getElementById('fontSelect').value;
            data.accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            data.accentLight = getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim();
            data.accentDark = getComputedStyle(document.documentElement).getPropertyValue('--accent-dark').trim();
            data.declaration = document.getElementById('in-declaration').checked;
            // Save dynamic entries
            data.eduEntries = []; document.querySelectorAll('#eduContainer > div').forEach(d => {
                data.eduEntries.push({ qual: d.querySelector('.edu-qual')?.value, board: d.querySelector('.edu-board')?.value, year: d.querySelector('.edu-year')?.value, marks: d.querySelector('.edu-marks')?.value, subjects: d.querySelector('.edu-subjects')?.value });
            });
            data.expEntries = []; document.querySelectorAll('#expContainer > div').forEach(d => {
                data.expEntries.push({ title: d.querySelector('.exp-title')?.value, company: d.querySelector('.exp-company')?.value, duration: d.querySelector('.exp-duration')?.value, desc: d.querySelector('.exp-desc')?.value });
            });
            data.refEntries = []; document.querySelectorAll('#refContainer > div').forEach(d => {
                data.refEntries.push({ name: d.querySelector('.ref-name')?.value, desg: d.querySelector('.ref-desg')?.value, contact: d.querySelector('.ref-contact')?.value });
            });
            data.sectionStyles = sectionStyles;
            localStorage.setItem('biodataSave', JSON.stringify(data));
            
            // Trigger Live Preview Update
            updateLivePreview();
        }

        function loadFromStorage() {
            let saved = localStorage.getItem('biodataSave');
            
            // --- URL DATA SHARING LOGIC ---
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('data')) {
                try {
                    const decompressed = LZString.decompressFromEncodedURIComponent(urlParams.get('data'));
                    if (decompressed) {
                        saved = decompressed;
                        localStorage.setItem('biodataSave', saved);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } catch(e) { console.error("Could not parse URL data", e); }
            }
            
            if (!saved) { addEducation(); addLanguage(); return; }
            
            try {
                const data = JSON.parse(saved);
                document.querySelectorAll('.form-input').forEach(el => { 
                    if (el.id && data[el.id] !== undefined) {
                        if(el.type === 'checkbox') el.checked = data[el.id];
                        else el.value = data[el.id];
                    } 
                });
                if (data.skills) { skillsArray = data.skills; renderSkillsForm(); }
                if (data.photoDataUrl) { photoDataUrl = data.photoDataUrl; document.getElementById('imagePreview').src = photoDataUrl; document.getElementById('imagePreview').classList.remove('hidden'); document.getElementById('imagePlaceholder').classList.add('hidden'); }
                if (data.sigDataUrl) { sigDataUrl = data.sigDataUrl; document.getElementById('sigPreview').src = sigDataUrl; document.getElementById('sigPreview').classList.remove('hidden'); }
                if (data.isDark) toggleDark();
                if (data.font) { document.getElementById('fontSelect').value = data.font; setFont(data.font); }
                if (data.accent) setAccent(data.accent, data.accentLight, data.accentDark);
                if (data.declaration) document.getElementById('in-declaration').checked = true;
                if (data.langEntries && data.langEntries.length > 0) data.langEntries.forEach(e => addLanguage(e));
                else addLanguage();
                if (data.eduEntries && data.eduEntries.length > 0) data.eduEntries.forEach(e => addEducation(e));
                else addEducation();
                if (data.expEntries) data.expEntries.forEach(e => addExperience(e));
                if (data.refEntries) data.refEntries.forEach(e => addReference(e));
                if (data.sectionStyles) {
                    sectionStyles = data.sectionStyles;
                } else if (data.sectionBgColors) {
                    // Backwards compatibility
                    Object.keys(data.sectionBgColors).forEach(k => {
                        sectionStyles[k] = { bg: data.sectionBgColors[k], heading: '#000000', text: '#000000' };
                    });
                }

                if (data.fontScale) {
                    const fsInput = document.getElementById('fontScale');
                    if (fsInput) fsInput.value = data.fontScale;
                    updateFontSize(data.fontScale);
                }
            } catch(e) { console.error(e); addEducation(); addLanguage(); }
            
            // Force preview update so that dynamic fields show up immediately on reload
            setTimeout(updateLivePreview, 100);
        }

        function updateFontSize(percent) {
            document.getElementById('fontScaleVal').innerText = percent + '%';
            const scale = percent / 100;
            let styleEl = document.getElementById('dynamic-font-style');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'dynamic-font-style';
                document.head.appendChild(styleEl);
            }
            styleEl.innerHTML = `
                #biodataPaper { font-size: calc(13px * ${scale}) !important; }
                #biodataPaper h1 { font-size: calc(32px * ${scale}) !important; }
                #biodataPaper h3 { font-size: calc(15px * ${scale}) !important; }
                #biodataPaper h4 { font-size: calc(13px * ${scale}) !important; }
                #biodataPaper .text-\\[10px\\] { font-size: calc(10px * ${scale}) !important; }
                #biodataPaper .text-\\[11px\\] { font-size: calc(11px * ${scale}) !important; }
                #biodataPaper .text-\\[12px\\] { font-size: calc(12px * ${scale}) !important; }
                #biodataPaper .text-\\[13px\\] { font-size: calc(13px * ${scale}) !important; }
                #biodataPaper .text-\\[15px\\] { font-size: calc(15px * ${scale}) !important; }
            `;
            // Trigger save only if event originated from input (not load)
            if (event && event.type === 'input') saveToStorage();
        }

        // ====== ONBOARDING TOUR (Driver.js) ======
        function startTour(force = false) {
            const hasSeenTour = localStorage.getItem('hasSeenTour');
            if (hasSeenTour && !force) return;
            
            const goStep = (n) => {
                window.dispatchEvent(new CustomEvent('update-step', { detail: { step: n } }));
                // Small delay to let Alpine render before Driver tries to highlight
                return new Promise(resolve => setTimeout(resolve, 300));
            };

            const driverObj = window.driver.js.driver({
                showProgress: true,
                animate: true,
                steps: [
                    { element: '#tour-welcome', popover: { title: 'Welcome to Pro Biodata!', description: 'Let\'s build a highly professional, honest, and attractive CV together.', side: "bottom", align: 'start' }, onHighlightStarted: () => goStep(1) },
                    { element: '#tour-role', popover: { title: 'Professional Title', description: 'Avoid generic titles. Use exact, targeted roles (e.g. "Junior UI/UX Designer"). It makes a huge difference.', side: "bottom", align: 'start' }, onHighlightStarted: () => goStep(1) },
                    { element: '#tour-skills', popover: { title: 'Add Core Skills', description: 'Honesty is key! Only add skills you can confidently explain in an interview. Use our smart suggestions.', side: "top", align: 'start' }, onHighlightStarted: () => goStep(3) },
                    { element: '#tour-experience', popover: { title: 'Work Experience', description: 'Focus on your achievements and contributions, not just daily tasks.', side: "top", align: 'start' }, onHighlightStarted: () => goStep(3) },
                    { element: '#tour-generate', popover: { title: 'Generate PDF', description: 'Once everything is truthful and complete, generate your beautiful Pro Biodata here!', side: "top", align: 'start' }, onHighlightStarted: () => goStep(4) }
                ],
                onDestroyStarted: () => {
                    localStorage.setItem('hasSeenTour', 'true');
                    driverObj.destroy();
                }
            });
            driverObj.drive();
        }

        // Auto-save on all input changes
        document.addEventListener('input', e => { if (e.target.closest('#biodataForm')) saveToStorage(); });
        document.addEventListener('change', e => { if (e.target.closest('#biodataForm')) saveToStorage(); });

        // ====== LIVE PREVIEW LOGIC ======
        function updateLivePreview() {
            // Apply section background colors
            applySectionStyles();

            // Name + Role
            const inName = document.getElementById('in-name');
            if (inName) document.getElementById('out-name').innerText = inName.value;
            const inRole = document.getElementById('in-role');
            if (inRole) document.getElementById('out-role').innerText = inRole.value;

            // Photo
            const outPhoto = document.getElementById('out-photo');
            if (photoDataUrl) { outPhoto.src = photoDataUrl; outPhoto.classList.remove('hidden'); } else { outPhoto.classList.add('hidden'); }

            // Contact row
            const contactRow = document.getElementById('out-contact-row');
            contactRow.innerHTML = '';
            const contactItems = [
                { icon: '📞', val: document.getElementById('in-mobile').value },
                { icon: '✉️', val: document.getElementById('in-email').value },
                { icon: '🔗', val: document.getElementById('in-linkedin').value },
                { icon: '💻', val: document.getElementById('in-github').value },
            ];
            contactItems.forEach(c => {
                if (c.val && c.val.trim()) {
                    contactRow.innerHTML += `<span>${c.icon} ${c.val}</span>`;
                }
            });

            // Personal details
            const personalList = document.getElementById('out-personal-list');
            personalList.innerHTML = '';
            const personalFields = [
                { label: 'Date of Birth', val: document.getElementById('in-dob').value },
                { label: "Father's Name", val: document.getElementById('in-father').value },
                { label: "Mother's Name", val: document.getElementById('in-mother').value },
                { label: 'Gender', val: document.getElementById('in-gender').value },
                { label: 'Blood Group', val: document.getElementById('in-blood').value },
                { label: 'Category', val: document.getElementById('in-caste').value },
            ];
            personalFields.forEach(f => {
                if (f.val && f.val.trim()) {
                    personalList.innerHTML += `<div><span class="block text-[10px] font-bold text-gray-400 uppercase">${f.label}</span><span class="font-semibold text-[12px]">${f.val}</span></div>`;
                }
            });

            let langText = '';
            document.querySelectorAll('#langContainer > div').forEach(d => {
                const name = d.querySelector('.lang-name')?.value;
                const prof = d.querySelector('.lang-prof')?.value;
                if (name && name.trim()) {
                    langText += `${name} <span class="text-gray-500 font-normal">(${prof || 'Basic'})</span>, `;
                }
            });
            if (langText) {
                langText = langText.slice(0, -2);
                personalList.innerHTML += `<div><span class="block text-[10px] font-bold text-gray-400 uppercase">Languages</span><span class="font-semibold text-[12px]">${langText}</span></div>`;
            }

            // Address
            const addr = document.getElementById('in-address').value;
            if (addr && addr.trim()) { document.getElementById('out-address').innerText = addr; document.getElementById('out-address-section').classList.remove('hidden'); }
            else { document.getElementById('out-address-section').classList.add('hidden'); }

            // Objective
            const obj = document.getElementById('in-objective').value;
            const togObj = document.getElementById('tog-objective').checked;
            if (togObj && obj && obj.trim()) { document.getElementById('out-objective').innerText = obj; document.getElementById('out-objective-section').classList.remove('hidden'); }
            else { document.getElementById('out-objective-section').classList.add('hidden'); }

            // Education
            const eduList = document.getElementById('out-edu-list');
            eduList.innerHTML = '';
            let hasEdu = false;
            document.querySelectorAll('#eduContainer > div').forEach(d => {
                const qual = d.querySelector('.edu-qual')?.value;
                if (!qual || !qual.trim()) return;
                hasEdu = true;
                const board = d.querySelector('.edu-board')?.value || '';
                const year = d.querySelector('.edu-year')?.value || '';
                const marks = d.querySelector('.edu-marks')?.value || '';
                const subjects = d.querySelector('.edu-subjects')?.value || '';
                eduList.innerHTML += `
                <div class="accent-border-left pl-3 py-1">
                    <div class="flex justify-between items-baseline"><h4 class="font-bold text-[13px]">${qual}</h4>${year ? `<span class="text-[11px] font-bold accent-bg-light px-2 py-0.5 rounded">${year}</span>` : ''}</div>
                    ${board ? `<p class="text-[11px] text-gray-500 font-medium">${board}</p>` : ''}
                    ${marks ? `<p class="text-[11px] text-gray-600"><span class="font-semibold">Score:</span> ${marks}</p>` : ''}
                    ${subjects ? `<p class="text-[11px] text-gray-500">${subjects}</p>` : ''}
                </div>`;
            });
            document.getElementById('out-edu-section').classList.toggle('hidden', !hasEdu || !document.getElementById('tog-education').checked);

            // Experience
            const expList = document.getElementById('out-exp-list');
            expList.innerHTML = '';
            let hasExp = false;
            document.querySelectorAll('#expContainer > div').forEach(d => {
                const title = d.querySelector('.exp-title')?.value;
                if (!title || !title.trim()) return;
                hasExp = true;
                const company = d.querySelector('.exp-company')?.value || '';
                const duration = d.querySelector('.exp-duration')?.value || '';
                const desc = d.querySelector('.exp-desc')?.value || '';
                expList.innerHTML += `
                <div class="accent-border-left pl-3 py-1">
                    <div class="flex justify-between items-baseline"><h4 class="font-bold text-[13px]">${title}</h4>${duration ? `<span class="text-[11px] font-semibold text-gray-500">${duration}</span>` : ''}</div>
                    ${company ? `<p class="text-[11px] accent-text font-semibold">${company}</p>` : ''}
                    ${desc ? `<p class="text-[11px] text-gray-600 mt-1">${desc}</p>` : ''}
                </div>`;
            });
            document.getElementById('out-exp-section').classList.toggle('hidden', !hasExp || !document.getElementById('tog-experience').checked);

            // Certifications
            const certs = document.getElementById('in-certs').value;
            const togCerts = document.getElementById('tog-certs').checked;
            if (togCerts && certs && certs.trim()) { document.getElementById('out-certs').innerText = certs; document.getElementById('out-certs-section').classList.remove('hidden'); }
            else { document.getElementById('out-certs-section').classList.add('hidden'); }

            // Projects
            const proj = document.getElementById('in-projects').value;
            const togProj = document.getElementById('tog-projects').checked;
            if (togProj && proj && proj.trim()) { 
                let escapedProj = proj.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                
                // Parse standard markdown [Text](URL) and user custom Text[URL]
                let linkedProj = escapedProj
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, url) {
                        let fullUrl = url.match(/^https?:\/\//) ? url : 'https://' + url;
                        return `<a href="${fullUrl}" target="_blank" onclick="return confirm('You are being redirected to:\\n' + this.href)" class="text-blue-600 underline font-semibold">${text}</a>`;
                    })
                    .replace(/([^\s\[\]]+)\[([^\]]+)\]/g, function(match, text, url) {
                        let fullUrl = url.match(/^https?:\/\//) ? url : 'https://' + url;
                        return `<a href="${fullUrl}" target="_blank" onclick="return confirm('You are being redirected to:\\n' + this.href)" class="text-blue-600 underline font-semibold">${text}</a>`;
                    });

                document.getElementById('out-projects').innerHTML = linkedProj; 
                document.getElementById('out-projects-section').classList.remove('hidden'); 
            }
            else { document.getElementById('out-projects-section').classList.add('hidden'); }

            // Hobbies
            const hobbies = document.getElementById('in-hobbies').value;
            const togHob = document.getElementById('tog-hobbies').checked;
            if (togHob && hobbies && hobbies.trim()) { document.getElementById('out-hobbies').innerText = hobbies; document.getElementById('out-hobbies-section').classList.remove('hidden'); }
            else { document.getElementById('out-hobbies-section').classList.add('hidden'); }

            // Skills
            const outSkills = document.getElementById('out-skills');
            outSkills.innerHTML = '';
            const togSkills = document.getElementById('tog-skills').checked;
            if (togSkills && skillsArray.length > 0) {
                document.getElementById('out-skills-section').classList.remove('hidden');
                skillsArray.forEach(s => {
                    outSkills.innerHTML += `<span class="px-2 py-0.5 accent-bg-light accent-border text-[11px] font-semibold rounded skill-tag-print" style="border-width:1px;">${s}</span>`;
                });
            } else { document.getElementById('out-skills-section').classList.add('hidden'); }

            // References
            const refList = document.getElementById('out-ref-list');
            refList.innerHTML = '';
            let hasRef = false;
            document.querySelectorAll('#refContainer > div').forEach(d => {
                const name = d.querySelector('.ref-name')?.value;
                if (!name || !name.trim()) return;
                hasRef = true;
                const desg = d.querySelector('.ref-desg')?.value || '';
                const contact = d.querySelector('.ref-contact')?.value || '';
                refList.innerHTML += `<div class="text-[12px]"><span class="font-bold">${name}</span>${desg ? ` — <span class="text-gray-500">${desg}</span>` : ''}${contact ? `<br><span class="text-gray-500">${contact}</span>` : ''}</div>`;
            });
            document.getElementById('out-ref-section').classList.toggle('hidden', !hasRef || !document.getElementById('tog-references').checked);

            // Declaration
            if (document.getElementById('in-declaration').checked) {
                document.getElementById('out-declaration-section').classList.remove('hidden');
                document.getElementById('out-date').innerText = new Date().toLocaleDateString('en-IN');
                document.getElementById('out-sig-name').innerText = document.getElementById('in-name').value;
                if (sigDataUrl) { document.getElementById('out-signature').src = sigDataUrl; document.getElementById('out-signature').classList.remove('hidden'); }
                else { document.getElementById('out-signature').classList.add('hidden'); }
            } else { document.getElementById('out-declaration-section').classList.add('hidden'); }
        }

        function generateBiodata(event) {
            if(event) event.preventDefault();
            
            if (window.innerWidth >= 1280) {
                // On PC, generate button directly saves/prints PDF
                printBiodata();
                return;
            }

            document.body.classList.add('mobile-view-preview');
            document.getElementById('previewWrapper').classList.remove('hidden');
            document.getElementById('previewWrapper').classList.add('flex');
            window.scrollTo(0, 0);
        }

        function editBiodata() {
            document.body.classList.remove('mobile-view-preview');
            document.getElementById('previewWrapper').classList.add('hidden');
            document.getElementById('previewWrapper').classList.remove('flex');
            document.getElementById('formView').classList.remove('hidden');
            window.scrollTo(0, 0);
        }

        // ====== PRINT / SAVE PDF ======
        function printBiodata() {
            const paper = document.getElementById('biodataPaper');
            if (!paper) return;

            // Collect CSS variables
            const rs = getComputedStyle(document.documentElement);
            const font = rs.getPropertyValue('--font-family').trim() || 'Outfit, sans-serif';
            const accent = rs.getPropertyValue('--accent').trim();
            const accentLight = rs.getPropertyValue('--accent-light').trim();
            const accentDark = rs.getPropertyValue('--accent-dark').trim();

            // Collect all stylesheets from the page (Tailwind generated + custom)
            let allCSS = '';
            document.querySelectorAll('style').forEach(s => { allCSS += s.innerHTML + '\n'; });

            // Get dynamic font-size styles if any
            const dynStyle = document.getElementById('dynamic-font-style');
            const dynCSS = dynStyle ? dynStyle.innerHTML : '';

            // Clone paper HTML
            const paperHTML = paper.outerHTML;

            // Create a hidden iframe — completely fresh rendering context
            const fr = document.createElement('iframe');
            fr.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px;top:-9999px;opacity:0';
            document.body.appendChild(fr);

            const d = fr.contentDocument;
            d.open();
            d.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>${allCSS}</style>
<style>
:root{--font-family:${font};--accent:${accent};--accent-light:${accentLight};--accent-dark:${accentDark}}
@page{size:A4;margin:14mm 16mm}
*,*::before,*::after{transform:none!important;-webkit-transform:none!important;transition:none!important;-webkit-transition:none!important;animation:none!important;will-change:auto!important;backface-visibility:visible!important;-webkit-backface-visibility:visible!important;perspective:none!important;contain:none!important;isolation:auto!important}
body{margin:0;padding:0;background:#fff;font-family:var(--font-family),sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
#biodataPaper{width:auto!important;min-height:auto!important;padding:0!important;margin:0!important;box-shadow:none!important;border-radius:0!important;overflow:visible!important}
.no-print{display:none!important}
.skill-tag-print{background:#f1f5f9!important;border:1px solid #999!important;color:#000!important}
${dynCSS}
</style>
</head><body>${paperHTML}</body></html>`);
            d.close();

            // Print after a short delay to let styles render
            setTimeout(() => {
                try {
                    fr.contentWindow.focus();
                    fr.contentWindow.print();
                } catch(e) {
                    // Fallback: print the main page directly
                    window.print();
                }
                // Cleanup iframe after print dialog closes
                setTimeout(() => { try { fr.remove(); } catch(e){} }, 5000);
            }, 600);
        }

        // ====== SHARE LINK ======
        function shareLink() {
            const btn = document.getElementById('btn-share');
            const span = btn.querySelector('span');
            try {
                let saved = localStorage.getItem('biodataSave');
                if (!saved) return;
                
                let dataObj = JSON.parse(saved);
                let compressed = LZString.compressToEncodedURIComponent(JSON.stringify(dataObj));
                
                // If URL length is too long (mostly due to photo base64), drop the photo and try again
                if (compressed.length > 5000 && dataObj.photo) {
                    delete dataObj.photo;
                    compressed = LZString.compressToEncodedURIComponent(JSON.stringify(dataObj));
                    alert("Your profile photo was too large to fit in a shareable link. The link has been generated without the photo. (All other text data is included!)");
                }
                
                const shareUrl = window.location.origin + window.location.pathname + '?data=' + compressed;
                navigator.clipboard.writeText(shareUrl).then(() => {
                    const orig = span.innerText;
                    span.innerText = "Link Copied!";
                    btn.classList.replace('text-indigo-700', 'text-green-700');
                    btn.classList.replace('bg-indigo-100', 'bg-green-100');
                    setTimeout(() => { 
                        span.innerText = orig; 
                        btn.classList.replace('text-green-700', 'text-indigo-700');
                        btn.classList.replace('bg-green-100', 'bg-indigo-100');
                    }, 3000);
                });
            } catch(e) {
                console.error("Share error", e);
                alert("Could not generate share link.");
            }
        }

        // ====== DEMO DATA ======
        function fillDemo() {
            document.getElementById('in-name').value = 'John Doe';
            document.getElementById('in-role').value = 'Full Stack Developer | Building scalable web apps';
            document.getElementById('in-dob').value = '15-08-1998';
            document.getElementById('in-father').value = 'Robert Doe';
            document.getElementById('in-mother').value = 'Mary Doe';
            document.getElementById('in-gender').value = 'Male';
            document.getElementById('in-blood').value = 'O+';
            document.getElementById('in-caste').value = 'General';
            document.getElementById('in-mobile').value = '9876543210';
            document.getElementById('in-email').value = 'johndoe@example.com';
            document.getElementById('in-linkedin').value = 'linkedin.com/in/johndoe';
            document.getElementById('in-github').value = 'github.com/johndoe';
            document.getElementById('in-address').value = '123 Innovation Avenue, Tech City, CA 94105';
            document.getElementById('in-projects').value = 'E-Commerce Platform — Built a full-stack shop with Stripe payments and real-time inventory.\nWeather Dashboard — React app with live weather data and 5-day forecasts.';
            document.getElementById('in-certs').value = 'AWS Certified Developer Associate\nComplete Web Development Bootcamp 2024';
            document.getElementById('in-hobbies').value = 'Open Source Contributing, Photography, Chess';
            document.getElementById('in-declaration').checked = true;

            // Clear and add languages
            document.getElementById('langContainer').innerHTML = ''; langCount = 0;
            addLanguage({ name: 'English', prof: 'Fluent' });
            addLanguage({ name: 'Spanish', prof: 'Conversational' });

            // Clear and add demo education
            document.getElementById('eduContainer').innerHTML = ''; eduCount = 0;
            addEducation({ qual: 'B.Tech in Computer Science', board: 'State Technological University', year: '2020', marks: '8.5 CGPA (85%)', subjects: 'Data Structures, Algorithms, Databases, Web Development' });
            addEducation({ qual: 'Class XII (Science)', board: 'Central Board of Secondary Education (CBSE)', year: '2016', marks: '92%', subjects: 'Physics, Chemistry, Mathematics, English' });

            // Clear and add demo experience
            document.getElementById('expContainer').innerHTML = ''; expCount = 0;
            addExperience({ title: 'Software Engineer', company: 'TechCorp Solutions', duration: 'Jun 2020 — Present', desc: 'Developed scalable web apps using React & Node.js. Improved query performance by 40%.' });
            addExperience({ title: 'Frontend Intern', company: 'StartupXYZ', duration: 'Jan 2020 — May 2020', desc: 'Built responsive UI components and integrated REST APIs.' });

            // Clear and add demo references
            document.getElementById('refContainer').innerHTML = ''; refCount = 0;
            addReference({ name: 'Dr. Jane Smith', desg: 'CTO, TechCorp', contact: 'jane@techcorp.com' });

            // Demo skills
            skillsArray = ['JavaScript', 'React', 'Node.js', 'Tailwind CSS', 'SQL', 'Git', 'Python', 'AWS'];
            renderSkillsForm();
            saveToStorage();
        }

        // ====== ONBOARDING LOGIC ======
        function nextOnboarding() {
            const nameInput = document.getElementById('onb-name').value.trim();
            const name = nameInput || 'Awesome Person';
            
            document.getElementById('in-name').value = name;
            document.getElementById('out-name').innerText = name;
            document.getElementById('onb-greeting').innerText = `Nice to meet you, ${name.split(' ')[0]}!`;
            
            const s1 = document.getElementById('onb-step1');
            const s2 = document.getElementById('onb-step2');
            s1.classList.remove('scale-100', 'opacity-100');
            s1.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                s1.classList.add('hidden');
                s2.classList.remove('hidden');
                setTimeout(() => { s2.classList.remove('scale-95', 'opacity-0'); s2.classList.add('scale-100', 'opacity-100'); }, 50);
            }, 500);
        }

        function finishOnboarding(c, l, d) {
            setAccent(c, l, d);
            localStorage.setItem('hasSeenOnboarding', 'true');
            const overlay = document.getElementById('onboardingModal');
            overlay.classList.add('opacity-0');
            setTimeout(() => { 
                overlay.classList.add('hidden'); 
                saveToStorage();
                setTimeout(() => startTour(false), 300);
            }, 700);
        }

        // ====== INIT ======
        window.onload = () => {
            loadFromStorage();
            
            if (!localStorage.getItem('hasSeenOnboarding')) {
                // Show Onboarding
                const overlay = document.getElementById('onboardingModal');
                const s1 = document.getElementById('onb-step1');
                overlay.classList.remove('hidden');
                setTimeout(() => { 
                    s1.classList.remove('scale-95', 'opacity-0'); 
                    s1.classList.add('scale-100', 'opacity-100'); 
                }, 50);
            } else if (!localStorage.getItem('hasSeenTour')) {
                // Already onboarded but hasn't seen tour
                setTimeout(() => startTour(false), 800);
            }
        };

        // ====== CLEAR DATA ======
        function clearData() {
            document.getElementById('clearModal').classList.remove('hidden');
        }
        
        function executeClearData() {
            localStorage.removeItem('biodataSave');
            location.reload();
        }
