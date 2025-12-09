import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from 'zod'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import userService from "@/services/userService.js"

import useUserStore from "@/stores/useUserStore.js"




export function LoginForm({
  className,
  ...props
}) {
  const SigninSchema = z.object({
    email: z.email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 kí tự")
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(SigninSchema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await userService.login(data);
      const userData = response.data?.data?.user;
      useUserStore.getState().setUser(userData);
      toast.success("Đăng nhập thành công!");
      navigate("/mycourse");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(errorMsg);
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* logo  */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/"
                  className="mx-auto block w-fit text-center">
                  <img src="/TVCLogo.webp" alt="Image" className="h-15 w-auto"></img>
                </a>
                <h2 className="text-2xl font-bold"> Đăng nhập LMS TVC</h2>
                <p className="text-muted-foreground text-balance">Chào mừng bạn, hãy đăng nhập để bắt đầu</p>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email" className="block text-sm">Email</Label>
                  <Input type="text" id="email" placeholder="Email" {...register("email")} />

                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email.message}</p>
                  )}
                </div>
              </div>
              {/*password */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password" className="block text-sm">Mật khẩu</Label>
                  <Input type="password" id="password" placeholder="Mật khẩu" {...register("password")} />
                  {errors.password && (
                    <p className="text-destructive text-sm">{errors.password.message}</p>
                  )}
                </div>

              </div>
              {/*Nut Dang Nhap */}
              <Button type="submit" className="w-full" disabled={isSubmitting} >Đăng nhập</Button>
              <div className="text-center text-sm">Muốn quay lại trang chủ?{" "}
                <a href="/" className="underline underline-offset-2" > Trang chủ</a>
              </div>
            </div>
          </form>
          <div className="bg-white relative hidden md:block">
            <img
              src="/LoginSide.png"
              alt="Image"
              className="absolute  inset-0 object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
