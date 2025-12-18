
const resumeTemplates = [
    {
        id: 'futuristic',
        name: 'Futuristic',
        description: 'Aurora glassmorphism style for modern VAs.',
        render: (data) => `
            <div class="a4-preview bg-white text-black p-[25mm] h-full relative overflow-hidden font-sans">
                <!-- Decorative Elements -->
                <div class="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div class="flex justify-between items-start border-b-2 border-gray-900 pb-8 mb-8 relative z-10">
                    <div>
                        <h1 class="text-4xl font-bold tracking-tight uppercase mb-2">${data.name || 'YOUR NAME'}</h1>
                        <p class="text-xl text-blue-600 font-medium tracking-wide">${data.role || 'JOB TITLE'}</p>
                    </div>
                    <div class="text-right text-sm text-gray-600 font-mono space-y-1">
                        <p>${data.email || 'email@example.com'}</p>
                        <p>${data.phone || '+1 234 567 890'}</p>
                        <p>${data.location || 'Location, City'}</p>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-8 relative z-10">
                    <div class="col-span-8 space-y-8">
                        <div>
                            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Profile</h3>
                            <p class="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">${data.summary || 'Summary goes here...'}</p>
                        </div>
                        <div>
                            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Experience</h3>
                            <div class="space-y-6">
                                ${data.experience.map(exp => `
                                    <div class="mb-4">
                                        <div class="flex justify-between items-baseline mb-1">
                                            <h4 class="font-bold text-gray-900">${exp.role || 'Role'}</h4>
                                            <span class="text-xs font-mono text-gray-500">${exp.date || 'Date'}</span>
                                        </div>
                                        <p class="text-sm text-blue-600 font-medium mb-2">${exp.company || 'Company'}</p>
                                        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">${exp.desc || 'Description'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="col-span-4 space-y-8">
                        <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h3>
                            <div class="flex flex-wrap gap-2 mb-6">
                                ${(data.skills || 'Skill 1, Skill 2').split(',').map(s => `
                                    <span class="px-2 py-1 bg-white border border-gray-200 text-xs text-gray-700 rounded-md shadow-sm">${s.trim()}</span>
                                `).join('')}
                            </div>

                            ${data.education?.school ? `
                            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                            <div>
                                <h4 class="font-bold text-gray-900 text-sm">${data.education.school}</h4>
                                <p class="text-xs text-blue-600 font-medium mb-1">${data.education.degree}</p>
                                <p class="text-xs text-gray-500 font-mono">${data.education.year}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Classic serif layout for corporate roles.',
        render: (data) => `
            <div class="a4-preview bg-white text-gray-900 p-[25mm] h-full font-serif">
                <div class="text-center border-b border-gray-300 pb-6 mb-8">
                    <h1 class="text-3xl font-bold uppercase tracking-wider mb-2 text-gray-900">${data.name || 'YOUR NAME'}</h1>
                    <p class="text-md italic text-gray-600 mb-3">${data.role || 'Job Title'}</p>
                    <div class="flex justify-center gap-4 text-xs font-sans text-gray-500 uppercase tracking-widest">
                        <span>${data.email || 'email@example.com'}</span>
                        <span>|</span>
                        <span>${data.phone || 'Phone'}</span>
                        <span>|</span>
                        <span>${data.location || 'Location'}</span>
                    </div>
                </div>

                <!-- Summary -->
                <div class="mb-8">
                     <h3 class="text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-3">Professional Profile</h3>
                     <p class="text-sm leading-relaxed text-gray-700 text-justify">${data.summary || 'Summary...'}</p>
                </div>

                <!-- Experience -->
                <div class="mb-8">
                    <h3 class="text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">Work History</h3>
                    <div class="space-y-5">
                         ${data.experience.map(exp => `
                            <div>
                                <div class="flex justify-between items-baseline">
                                    <h4 class="font-bold text-md text-gray-800">${exp.role || 'Role'}</h4>
                                    <span class="text-xs font-sans text-gray-500">${exp.date || 'Date'}</span>
                                </div>
                                <div class="text-sm italic text-gray-600 mb-2">${exp.company || 'Company'}</div>
                                <div class="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-gray-200">${exp.desc || 'Description'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Education -->
                ${data.education?.school ? `
                <div class="mb-8">
                    <h3 class="text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">Education</h3>
                    <div>
                        <div class="flex justify-between items-baseline">
                            <h4 class="font-bold text-md text-gray-800">${data.education.school}</h4>
                             <span class="text-xs font-sans text-gray-500">${data.education.year}</span>
                        </div>
                        <p class="text-sm italic text-gray-600">${data.education.degree}</p>
                    </div>
                </div>
                ` : ''}

                <!-- Skills -->
                <div class="mb-8">
                    <h3 class="text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-3">Core Competencies</h3>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                         ${(data.skills || '').split(',').map(s => `
                            <div class="flex items-center gap-2">
                                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                <span>${s.trim()}</span>
                            </div>
                         `).join('')}
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Bold colors and unique layout.',
        render: (data) => `
            <div class="a4-preview bg-white text-gray-800 h-full font-sans flex flex-col">
                <!-- Header -->
                <div class="bg-gray-900 text-white p-[25mm] pb-12 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                     <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div class="relative z-10 flex justify-between items-end">
                        <div class="w-2/3">
                            <h1 class="text-5xl font-black mb-2 tracking-tighter leading-none">${data.name || 'YOUR NAME'}</h1>
                            <p class="text-xl font-medium text-gray-300 uppercase tracking-widest">${data.role || 'Creative Role'}</p>
                        </div>
                         <div class="w-1/3 text-right text-xs font-mono text-gray-400 space-y-1">
                            <p>${data.email || 'email'}</p>
                            <p>${data.phone || 'phone'}</p>
                            <p>${data.location || 'location'}</p>
                        </div>
                    </div>
                </div>

                <div class="flex-grow flex">
                    <!-- Sidebar -->
                    <div class="w-1/3 bg-gray-50 p-[25mm] border-r border-gray-100">
                        <div class="mb-8">
                            <h3 class="text-sm font-black text-purple-600 uppercase tracking-widest mb-4">Skills</h3>
                            <div class="flex flex-wrap gap-2">
                                 ${(data.skills || '').split(',').map(s => `
                                    <span class="bg-white border-2 border-gray-900 text-gray-900 px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">${s.trim()}</span>
                                `).join('')}
                            </div>
                        </div>

                        ${data.education?.school ? `
                         <div class="mb-8">
                            <h3 class="text-sm font-black text-purple-600 uppercase tracking-widest mb-4">Education</h3>
                            <div>
                                <p class="font-bold text-gray-900 text-sm">${data.education.school}</p>
                                <p class="text-xs text-gray-600 mb-1">${data.education.degree}</p>
                                <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">${data.education.year}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Main -->
                    <div class="w-2/3 p-[25mm]">
                         <div class="mb-10">
                            <h3 class="text-2xl font-black text-gray-900 mb-4 inline-block relative z-10">
                                Profile
                                <span class="absolute bottom-1 left-0 w-full h-3 bg-yellow-200 -z-10"></span>
                            </h3>
                            <p class="text-gray-700 leading-relaxed text-sm font-medium">${data.summary || 'Summary goes here...'}</p>
                        </div>

                         <div>
                            <h3 class="text-2xl font-black text-gray-900 mb-6 inline-block relative z-10">
                                Experience
                                <span class="absolute bottom-1 left-0 w-full h-3 bg-purple-200 -z-10"></span>
                            </h3>
                            <div class="space-y-8 border-l-2 border-gray-100 pl-6 ml-2">
                                ${data.experience.map(exp => `
                                    <div class="relative">
                                        <div class="absolute -left-[31px] top-1 w-4 h-4 bg-gray-900 rounded-full border-4 border-white"></div>
                                        <h4 class="font-bold text-lg text-gray-900">${exp.role || 'Role'}</h4>
                                        <div class="text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">${exp.company} | ${exp.date}</div>
                                        <p class="text-sm text-gray-600 leading-relaxed">${exp.desc || 'Description'}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Clean, simple, and elegant.',
        render: (data) => `
            <div class="a4-preview bg-white text-gray-800 p-[25mm] h-full font-sans">
                <div class="mb-12">
                    <h1 class="text-3xl font-light tracking-wide mb-1 text-gray-900">${data.name || 'Your Name'}</h1>
                    <p class="text-sm text-gray-500 tracking-widest uppercase mb-6">${data.role || 'Job Title'}</p>
                    <div class="flex gap-6 text-xs text-gray-400">
                        <span>${data.email}</span>
                        <span>${data.phone}</span>
                        <span>${data.location}</span>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-12">
                     <div class="col-span-3 text-right">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Summary</h3>
                    </div>
                    <div class="col-span-9 mb-8">
                        <p class="text-xs leading-6 text-gray-600">${data.summary || 'Summary text...'}</p>
                    </div>

                    <div class="col-span-3 text-right">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Experience</h3>
                    </div>
                    <div class="col-span-9 space-y-8 mb-8">
                         ${data.experience.map(exp => `
                            <div>
                                <div class="flex justify-between items-baseline mb-1">
                                    <h4 class="font-semibold text-sm text-gray-800">${exp.role}</h4>
                                    <span class="text-[10px] text-gray-400 font-mono">${exp.date}</span>
                                </div>
                                <div class="text-[11px] text-gray-500 uppercase tracking-wider mb-2">${exp.company}</div>
                                <p class="text-xs leading-5 text-gray-600">${exp.desc}</p>
                            </div>
                        `).join('')}
                    </div>

                    ${data.education?.school ? `
                    <div class="col-span-3 text-right">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Education</h3>
                    </div>
                    <div class="col-span-9 mb-8">
                        <div>
                            <div class="flex justify-between items-baseline mb-1">
                                <h4 class="font-semibold text-sm text-gray-800">${data.education.school}</h4>
                                <span class="text-[10px] text-gray-400 font-mono">${data.education.year}</span>
                            </div>
                            <div class="text-[11px] text-gray-500 uppercase tracking-wider mb-2">${data.education.degree}</div>
                        </div>
                    </div>
                    ` : ''}

                     <div class="col-span-3 text-right">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Skills</h3>
                    </div>
                    <div class="col-span-9">
                        <div class="flex flex-wrap gap-x-4 gap-y-2">
                             ${(data.skills || '').split(',').map(s => `
                                <span class="text-xs text-gray-600 border-b border-gray-200 pb-0.5">${s.trim()}</span>
                             `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'Strong sidebar layout for leaders.',
        render: (data) => `
            <div class="a4-preview bg-white text-gray-800 h-full font-sans flex">
                <!-- Sidebar -->
                <div class="w-[30%] bg-slate-800 text-white p-[25mm] flex flex-col h-full">
                    <div class="mb-10 text-center">
                         <div class="w-32 h-32 mx-auto bg-slate-700 rounded-full mb-4 flex items-center justify-center text-4xl font-serif text-slate-500 opacity-50">
                            ${(data.name || 'A')[0]}
                         </div>
                         <h2 class="text-lg font-bold">Contact</h2>
                         <div class="w-10 h-0.5 bg-blue-400 mx-auto mt-2 mb-4"></div>
                         <div class="text-xs text-slate-300 space-y-2 opacity-80">
                            <p>${data.email}</p>
                            <p>${data.phone}</p>
                            <p>${data.location}</p>
                         </div>
                    </div>
                    
                    ${data.education?.school ? `
                    <div class="mb-10">
                        <h2 class="text-lg font-bold text-center">Education</h2>
                        <div class="w-10 h-0.5 bg-blue-400 mx-auto mt-2 mb-4"></div>
                        <div class="text-center">
                            <h4 class="font-bold text-sm text-white">${data.education.school}</h4>
                            <p class="text-xs text-slate-400 mb-1">${data.education.degree}</p>
                             <span class="text-[10px] text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">${data.education.year}</span>
                        </div>
                    </div>
                    ` : ''}

                    <div>
                        <h2 class="text-lg font-bold text-center">Expertise</h2>
                        <div class="w-10 h-0.5 bg-blue-400 mx-auto mt-2 mb-6"></div>
                        <ul class="space-y-3 text-xs text-slate-300">
                             ${(data.skills || '').split(',').map(s => `
                                <li class="flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    ${s.trim()}
                                </li>
                             `).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="w-[70%] p-[25mm]">
                    <div class="border-l-4 border-slate-800 pl-6 mb-12">
                        <h1 class="text-4xl font-bold text-slate-800 tracking-tight uppercase">${data.name || 'YOUR NAME'}</h1>
                        <p class="text-lg text-blue-600 font-medium mt-1 tracking-wide uppercase">${data.role || 'EXECUTIVE TITLE'}</p>
                    </div>

                    <div class="mb-10">
                        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Professional Summary</h3>
                        <p class="text-sm text-slate-700 leading-relaxed text-justify">${data.summary || 'Executive summary...'}</p>
                    </div>

                    <div>
                        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">Career Progression</h3>
                        <div class="space-y-8">
                             ${data.experience.map(exp => `
                                <div>
                                    <div class="flex justify-between items-end mb-2">
                                        <h4 class="font-bold text-lg text-slate-800">${exp.role}</h4>
                                        <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">${exp.date}</span>
                                    </div>
                                    <p class="text-sm font-semibold text-slate-500 mb-2">${exp.company}</p>
                                    <p class="text-sm text-slate-600 leading-relaxed">${exp.desc}</p>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'tech',
        name: 'Technical',
        description: 'Monospace accents for developers.',
        render: (data) => `
             <div class="a4-preview bg-white text-gray-900 p-[25mm] h-full font-sans">
                <div class="border-b-4 border-black pb-8 mb-8 flex justify-between items-center">
                    <div>
                        <h1 class="text-4xl font-mono font-bold tracking-tighter mb-2">&lt;${data.name || 'Dev'} /&gt;</h1>
                        <p class="text-md font-mono text-pink-600">{ ${data.role || 'Full Stack Developer'} }</p>
                    </div>
                     <div class="text-right text-xs font-mono text-gray-500">
                        <p>ssh: ${data.email || 'email'}</p>
                        <p>bg: ${data.phone || 'phone'}</p>
                        <p>loc: ${data.location || 'loc'}</p>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-8">
                    <div class="col-span-1">
                        <div class="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                            <h3 class="font-mono font-bold text-sm mb-3 text-pink-600">./skills</h3>
                            <div class="flex flex-wrap gap-2">
                                ${(data.skills || '').split(',').map(s => `
                                    <span class="text-[10px] font-mono bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-600">${s.trim()}</span>
                                `).join('')}
                            </div>
                        </div>

                        ${data.education?.school ? `
                        <div class="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                            <h3 class="font-mono font-bold text-sm mb-3 text-pink-600">./education</h3>
                            <div class="text-[11px] font-mono leading-5">
                                <span class="block font-bold text-gray-800">${data.education.school}</span>
                                <span class="block text-gray-600">${data.education.degree}</span>
                                <span class="block text-gray-400 mt-1">&lt;${data.education.year}&gt;</span>
                            </div>
                        </div>
                        ` : ''}

                        <div class="bg-gray-50 p-4 rounded border border-gray-200">
                             <h3 class="font-mono font-bold text-sm mb-3 text-pink-600">./about</h3>
                             <p class="text-[11px] leading-5 text-gray-600 font-mono text-justify">${data.summary || 'System initialized...'}</p>
                        </div>
                    </div>

                    <div class="col-span-2">
                         <h3 class="font-mono font-bold text-lg mb-6 flex items-center gap-2">
                            <span class="text-pink-600">></span> experience_log
                         </h3>
                         <div class="space-y-8">
                             ${data.experience.map(exp => `
                                <div class="relative pl-6 border-l border-dashed border-gray-300">
                                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-black rounded-full"></div>
                                    <div class="flex justify-between items-baseline mb-1">
                                        <h4 class="font-bold text-gray-900 font-mono">${exp.role}</h4>
                                        <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">${exp.date}</span>
                                    </div>
                                    <p class="text-xs font-mono text-pink-600 mb-2">@${exp.company}</p>
                                    <p class="text-sm text-gray-700 leading-relaxed">${exp.desc}</p>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                </div>
             </div>
        `
    },
];
