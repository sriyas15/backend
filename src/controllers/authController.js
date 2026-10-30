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

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refresh(refreshToken);

            res.status(200).json({
                message: "Tokens refreshed successfully",
                data: tokens
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            // req.user is set by authMiddleware (access token required to logout)
            await authService.logout(req.user.id);

            res.status(200).json({
                message: "Logged out successfully"
            });
        } catch (error) {
            next(error);
        }
    }

    async getMe(req, res, next) {
        try {
            const user = await authService.getCurrentUser(req.user.id);
            res.status(200).json({
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
