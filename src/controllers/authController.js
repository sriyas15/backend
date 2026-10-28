const authService = require("../services/authService");

class AuthController {
    async signup(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const result = await authService.signup({ name, email, password });

            res.status(201).json({
                message: "User registered successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });

            res.status(200).json({
                message: "Login successful",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getMe(req, res, next) {
        try {
            res.status(200).json({
                data: req.currentUser
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
