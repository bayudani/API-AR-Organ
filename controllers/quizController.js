import prisma from "../db/prisma.js";

// --- (C)REATE: Bikin Kuis General ---
export const createQuizWithQuestions = async (req, res) => {
    // Gak butuh systemId lagi
    const { title, description, thumbnailUrl, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Judul dan array Questions wajib diisi" });
    }

    try {
        const newQuiz = await prisma.quiz.create({
            data: {
                title,
                description,
                thumbnailUrl, // Simpan URL gambar cover kuis kalau ada
                questions: {
                    create: questions.map((q) => ({
                        questionText: q.questionText,
                        imageUrl: q.imageUrl,
                        options: {
                            create: q.options.map((opt) => ({
                                optionText: opt.optionText,
                                isCorrect: opt.isCorrect || false,
                            })),
                        },
                    })),
                },
            },
            include: {
                questions: {
                    include: { options: true },
                },
            },
        });

        res.status(201).json({
            message: "Kuis General berhasil dibuat!",
            data: newQuiz,
        });
    } catch (error) {
        console.error("❌ Error Create Quiz:", error);
        res.status(500).json({ message: "Gagal membuat kuis", error: error.message });
    }
};

// --- (R)EAD: Ambil LIST Semua Kuis ---
export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                _count: {
                    select: { questions: true } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ data: quizzes });
    } catch (error) {
        console.error("❌ Error Get All Quizzes:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- (R)EAD: Ambil Detail Kuis (pas mau main) ---
export const getQuizById = async (req, res) => {
    const { id } = req.params;

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: parseInt(id) },
            include: {
                questions: {
                    include: {
                        options: {
                            select: { id: true, optionText: true } 
                        }
                    }
                }
            }
        });

        if (!quiz) return res.status(404).json({ message: "Kuis tidak ditemukan" });

        res.status(200).json({ data: quiz });
    } catch (error) {
        console.error("❌ Error Get Quiz Detail:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateQuiz = async (req, res) => {
    const { id } = req.params;
    const { title, description, thumbnailUrl, questions } = req.body;

    // Validasi ID
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID Kuis harus angka" });
    }

    try {
        // Kita pake Transaction implicit di Prisma update
        const updatedQuiz = await prisma.quiz.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                thumbnailUrl,
                questions: {
                    // 1. HAPUS SEMUA soal lama (dan otomatis hapus opsi karena Cascade)
                    deleteMany: {}, 
                    
                    // 2. BUAT ULANG soal baru dari data form
                    create: questions.map((q) => ({
                        questionText: q.questionText,
                        imageUrl: q.imageUrl,
                        options: {
                            create: q.options.map((opt) => ({
                                optionText: opt.optionText,
                                isCorrect: opt.isCorrect || false,
                            })),
                        },
                    })),
                },
            },
            include: {
                questions: {
                    include: { options: true },
                },
            },
        });

        res.status(200).json({
            message: "Kuis berhasil diupdate!",
            data: updatedQuiz,
        });

    } catch (error) {
        console.error("❌ Error Update Quiz:", error);

        // Handle Record Not Found
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Kuis tidak ditemukan" });
        }

        res.status(500).json({ message: "Gagal update kuis", error: error.message });
    }
};

// --- (D)ELETE: Hapus Kuis ---
export const deleteQuiz = async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID Kuis harus angka" });
    }

    try {
        // Prisma bakal otomatis hapus Questions & Options terkait karena 'onDelete: Cascade' di schema
        await prisma.quiz.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({ message: "Kuis berhasil dihapus permanen" });

    } catch (error) {
        console.error("❌ Error Delete Quiz:", error);

        if (error.code === "P2025") {
            return res.status(404).json({ message: "Kuis tidak ditemukan atau sudah dihapus" });
        }

        res.status(500).json({ message: "Gagal hapus kuis", error: error.message });
    }
};

// --- (POST) SUBMIT & CALCULATE SCORE ---
export const submitQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { userId, answers } = req.body;

    if (!userId || !answers) {
        return res.status(400).json({ message: "User ID dan Jawaban wajib ada" });
    }

    try {
        // 1. CEK HISTORY DULU (SATPAM) 👮‍♂️✋
        const existingHistory = await prisma.userQuizHistory.findFirst({
            where: {
                userId: parseInt(userId),
                quizId: parseInt(quizId)
            }
        });

        // Kalau udah pernah ngerjain, langsung tolak!
        if (existingHistory) {
            return res.status(403).json({ 
                message: "Eits, gabisa curang! Kamu sudah pernah mengerjakan kuis ini.",
                detail: "Hubungi admin/guru jika ingin remedial (data harus dihapus dulu)."
            });
        }

        // 2. Ambil Kunci Jawaban
        const quizData = await prisma.quiz.findUnique({
            where: { id: parseInt(quizId) },
            include: { questions: { include: { options: true } } }
        });

        if (!quizData) return res.status(404).json({ message: "Kuis tidak ditemukan" });

        // 3. Hitung Skor
        let correctCount = 0;
        const pointsPerQuestion = 10; 

        answers.forEach(userAns => {
            const question = quizData.questions.find(q => q.id === userAns.questionId);
            if (question) {
                const selectedOption = question.options.find(opt => opt.id === userAns.optionId);
                if (selectedOption && selectedOption.isCorrect) correctCount++;
            }
        });

        const scoreEarned = correctCount * pointsPerQuestion;

        // 4. Simpan Nilai & Update Poin User (Transaksi)
        await prisma.$transaction([
            // Simpan history biar ketahuan udah pernah main
            prisma.userQuizHistory.create({
                data: {
                    userId: parseInt(userId),
                    quizId: parseInt(quizId),
                    score: scoreEarned
                }
            }),
            // Tambah poin ke user
            prisma.user.update({
                where: { id: parseInt(userId) },
                data: { points: { increment: scoreEarned } }
            })
        ]);

        res.status(200).json({
            message: "Kuis selesai! Nilai berhasil disimpan.",
            result: {
                correct: correctCount,
                total: quizData.questions.length,
                scoreEarned: scoreEarned
            }
        });

    } catch (error) {
        console.error("❌ Error Submit Quiz:", error);
        res.status(500).json({ message: "Gagal submit kuis", error: error.message });
    }
};