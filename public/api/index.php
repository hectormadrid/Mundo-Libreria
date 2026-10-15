<?php
/**
 * Punto de entrada único de la API REST de Mundo Librería.
 * Todas las respuestas son JSON: { "data": ... } o { "error": "..." }.
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use App\Controllers\Admin;
use App\Controllers\AuthController;
use App\Controllers\CartController;
use App\Controllers\CatalogController;
use App\Controllers\OrderController;
use App\Controllers\ProfileController;
use App\Helpers\EnvLoader;
use App\Helpers\SessionHelper;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Http\Router;

EnvLoader::load(__DIR__ . '/../../.env');
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$router = new Router();

// Autenticación
$router->get('/auth/session', [AuthController::class, 'session']);
$router->post('/auth/login', [AuthController::class, 'login']);
$router->post('/auth/register', [AuthController::class, 'register']);
$router->post('/auth/logout', [AuthController::class, 'logout']);
$router->post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/auth/reset-password/validate', [AuthController::class, 'validateResetToken']);
$router->post('/auth/reset-password', [AuthController::class, 'resetPassword']);
$router->post('/admin/auth/login', [AuthController::class, 'adminLogin']);

// Catálogo público
$router->get('/categories', [CatalogController::class, 'categories']);
$router->get('/families', [CatalogController::class, 'families']);
$router->get('/products', [CatalogController::class, 'products']);
$router->get('/products/{id}', [CatalogController::class, 'product']);

// Carrito
$router->get('/cart', [CartController::class, 'show']);
$router->post('/cart/items', [CartController::class, 'add']);
$router->patch('/cart/items/{productId}', [CartController::class, 'update']);
$router->delete('/cart/items/{productId}', [CartController::class, 'remove']);
$router->delete('/cart', [CartController::class, 'clear']);

// Cuenta del cliente
$router->get('/profile', [ProfileController::class, 'show']);
$router->put('/profile', [ProfileController::class, 'update']);
$router->get('/orders', [OrderController::class, 'index']);
$router->post('/orders', [OrderController::class, 'store']);
$router->get('/orders/{id}', [OrderController::class, 'show']);

// Administración
$router->get('/admin/metrics', [Admin\DashboardController::class, 'metrics']);
$router->get('/admin/products', [Admin\ProductController::class, 'index']);
$router->post('/admin/products', [Admin\ProductController::class, 'store']);
$router->post('/admin/products/{id}', [Admin\ProductController::class, 'update']);
$router->patch('/admin/products/{id}/status', [Admin\ProductController::class, 'updateStatus']);
$router->get('/admin/orders', [Admin\OrderController::class, 'index']);
$router->get('/admin/orders/{id}', [Admin\OrderController::class, 'show']);
$router->patch('/admin/orders/{id}/status', [Admin\OrderController::class, 'updateStatus']);
$router->get('/admin/users', [Admin\UserController::class, 'index']);
$router->put('/admin/users/{id}', [Admin\UserController::class, 'update']);
$router->delete('/admin/users/{id}', [Admin\UserController::class, 'destroy']);
$router->get('/admin/categories', [Admin\CategoryController::class, 'index']);
$router->post('/admin/categories', [Admin\CategoryController::class, 'store']);
$router->put('/admin/categories/{id}', [Admin\CategoryController::class, 'update']);
$router->delete('/admin/categories/{id}', [Admin\CategoryController::class, 'destroy']);
$router->get('/admin/families', [Admin\FamilyController::class, 'index']);
$router->post('/admin/families', [Admin\FamilyController::class, 'store']);
$router->put('/admin/families/{id}', [Admin\FamilyController::class, 'update']);
$router->delete('/admin/families/{id}', [Admin\FamilyController::class, 'destroy']);
$router->get('/admin/admins', [Admin\AdminUserController::class, 'index']);
$router->post('/admin/admins', [Admin\AdminUserController::class, 'store']);
$router->delete('/admin/admins/{id}', [Admin\AdminUserController::class, 'destroy']);

try {
    SessionHelper::start();
    $request = Request::fromGlobals();

    if (!in_array($request->method, ['GET', 'HEAD', 'OPTIONS'], true)) {
        Auth::verifyCsrf($request);
    }

    $result = $router->dispatch($request);
    if ($result instanceof Response) {
        Response::send($result->data, $result->status);
    } else {
        Response::send($result);
    }
} catch (HttpException $e) {
    Response::error($e->getMessage(), $e->getStatus());
} catch (\Throwable $e) {
    error_log('Error en la API: ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
    Response::error('Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.', 500);
}
