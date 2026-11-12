import * as React from "react"
import { View } from "react-native"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Alert, AlertDescription, AlertTitle,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger,
  AreaChart, Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription,
  AttachmentMedia, AttachmentTitle,
  Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage,
  Badge, BarChart,
  BoldIcon, Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
  Bubble, BubbleContent, BubbleGroup, BubbleReactions,
  Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText,
  Calendar, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
  ChartContainer, ChartLegend, Checkbox, CheckIcon, CircleAlertIcon,
  Collapsible, CollapsibleContent, CollapsibleTrigger, ChevronsUpDownIcon,
  Combobox,
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  CommandSeparator, CommandShortcut,
  ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel,
  ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut,
  ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger,
  CopyIcon, DataTable, DatePicker,
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  DirectionProvider,
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
  Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet,
  FileIcon, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
  HomeIcon, HoverCard, HoverCardContent, HoverCardTrigger,
  ImageCard, InboxIcon, InfoIcon, Input,
  InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea,
  InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_DIGITS,
  Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle, ItalicIcon,
  Kbd, KbdGroup, Label, LineChart, MailIcon,
  Marker, MarkerContent, MarkerIcon, Marquee,
  Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup,
  MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent,
  MenubarSubTrigger, MenubarTrigger,
  Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader,
  MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerViewport,
  NativeSelect, NativeSelectOptGroup, NativeSelectOption,
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList,
  NavigationMenuTrigger,
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext,
  PaginationPrevious, PieChart, PlusIcon,
  Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger,
  Progress, ProgressLabel, ProgressValue,
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireDescription,
  QuestionnaireError, QuestionnaireInput, QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious,
  QuestionnaireProgress, QuestionnaireSubmit, QuestionnaireTitle,
  RadioGroup, RadioGroupItem,
  ResizableHandle, ResizablePanel, ResizablePanelGroup,
  ScrollArea, SearchIcon,
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
  SendIcon, SettingsIcon,
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarTrigger,
  Skeleton, Slider, Spinner, StarIcon, Switch,
  Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger, Text, Textarea, toast,
  Toggle, ToggleGroup, ToggleGroupItem, Tooltip, TooltipContent, TooltipTrigger,
  TrashIcon, TriangleAlertIcon, UnderlineIcon, UploadIcon, UserIcon, XIcon,
  type ChartConfig, type DataTableColumn, type DateRange,
} from "neobrutalism-native"

export type Demo = { name: string; description?: string; Component: React.ComponentType }

const Row = ({ children, wrap = true }: { children?: React.ReactNode; wrap?: boolean }) => (
  <View style={{ flexDirection: "row", flexWrap: wrap ? "wrap" : "nowrap", gap: 12, alignItems: "center" }}>{children}</View>
)
const Stack = ({ children, gap = 16 }: { children?: React.ReactNode; gap?: number }) => <View style={{ gap }}>{children}</View>

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

type Payment = { id: string; amount: number; status: "pending" | "processing" | "success" | "failed"; email: string }
const payments: Payment[] = [
  { id: "m5gr84i9", amount: 316, status: "success", email: "ken99@example.com" },
  { id: "3u1reuv4", amount: 242, status: "success", email: "abe45@example.com" },
  { id: "derv1ws0", amount: 837, status: "processing", email: "monserrat44@example.com" },
  { id: "5kma53ae", amount: 874, status: "success", email: "silas22@example.com" },
  { id: "bhqecj4p", amount: 721, status: "failed", email: "carmella@example.com" },
  { id: "p0r8sd2k", amount: 129, status: "pending", email: "jules@example.com" },
  { id: "x9a7c1mq", amount: 450, status: "success", email: "nadia@example.com" },
]

export const demos: Demo[] = [
  {
    name: "Accordion",
    Component: () => (
      <Accordion defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It uses accessibility roles and states on every platform.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>Yes. It comes with default neobrutalism styles.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>Yes. The height animates with the Animated API.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    name: "Alert",
    Component: () => (
      <Stack>
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components and dependencies to your app using the cli.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      </Stack>
    ),
  },
  {
    name: "Alert Dialog",
    Component: () => (
      <Row>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Show Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onPress={() => toast.success("Deleted")}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="neutral">Small with media</Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <TrashIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete file?</AlertDialogTitle>
              <AlertDialogDescription>This will remove it forever.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Row>
    ),
  },
  {
    name: "Attachment",
    Component: () => (
      <Stack gap={12}>
        <Attachment>
          <AttachmentMedia>
            <FileIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>report-final.pdf</AttachmentTitle>
            <AttachmentDescription>2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction accessibilityLabel="Remove">
              <XIcon size={14} />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Attachment state="uploading" size="sm">
          <AttachmentMedia>
            <Spinner />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>photo.png</AttachmentTitle>
            <AttachmentDescription>Uploading… 42%</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment state="error">
          <AttachmentMedia>
            <TriangleAlertIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>video.mov</AttachmentTitle>
            <AttachmentDescription>Upload failed</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment state="idle">
          <AttachmentMedia>
            <UploadIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Drop a file</AttachmentTitle>
          </AttachmentContent>
        </Attachment>
      </Stack>
    ),
  },
  {
    name: "Avatar",
    Component: () => (
      <Row>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>LG</AvatarFallback>
          <AvatarBadge>
            <CheckIcon />
          </AvatarBadge>
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </Row>
    ),
  },
  {
    name: "Badge",
    Component: () => (
      <Row>
        <Badge>Badge</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge>
          <StarIcon />
          With icon
        </Badge>
      </Row>
    ),
  },
  {
    name: "Breadcrumb",
    Component: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onPress={() => toast("Home")}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  },
  {
    name: "Bubble",
    Component: () => (
      <BubbleGroup>
        <Bubble>
          <BubbleContent>Hey! Did you see the new components?</BubbleContent>
        </Bubble>
        <Bubble variant="secondary" align="end">
          <BubbleContent>Yes, they look great 🔥</BubbleContent>
          <BubbleReactions>❤️ 2</BubbleReactions>
        </Bubble>
        <View style={{ height: 12 }} />
        <Bubble variant="muted">
          <BubbleContent onPress={() => toast("Bubble pressed")}>Tap me (pressable bubble)</BubbleContent>
        </Bubble>
        <Bubble variant="destructive" align="end">
          <BubbleContent>Message failed to send</BubbleContent>
        </Bubble>
      </BubbleGroup>
    ),
  },
  {
    name: "Button",
    description: "On the web the press effect also happens on hover.",
    Component: () => (
      <Stack>
        <Row>
          <Button onPress={() => toast("Default")}>Default</Button>
          <Button variant="noShadow">No Shadow</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="reverse">Reverse</Button>
        </Row>
        <Row>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" accessibilityLabel="Add">
            <PlusIcon />
          </Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Stack>
    ),
  },
  {
    name: "Button Group",
    Component: () => (
      <Stack>
        <ButtonGroup>
          <Button variant="noShadow">Archive</Button>
          <Button variant="noShadow">Report</Button>
          <Button variant="noShadow">Snooze</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>https://</ButtonGroupText>
          <Input placeholder="example.com" style={{ width: 180 }} />
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button variant="noShadow" size="icon" accessibilityLabel="Bold">
            <BoldIcon />
          </Button>
          <Button variant="noShadow" size="icon" accessibilityLabel="Italic">
            <ItalicIcon />
          </Button>
          <Button variant="noShadow" size="icon" accessibilityLabel="Underline">
            <UnderlineIcon />
          </Button>
        </ButtonGroup>
        <Row>
          <ButtonGroup>
            <Button variant="noShadow">Left</Button>
            <ButtonGroupSeparator />
            <Button variant="noShadow">Right</Button>
          </ButtonGroup>
        </Row>
      </Stack>
    ),
  },
  {
    name: "Calendar",
    Component: function CalendarDemo() {
      const [date, setDate] = React.useState<Date | undefined>(new Date())
      const [range, setRange] = React.useState<DateRange | undefined>()
      return (
        <Stack gap={24}>
          <Calendar mode="single" selected={date} onSelect={setDate} />
          <Text weight="heading">Range + dropdown caption</Text>
          <Calendar mode="range" selected={range} onSelect={setRange} captionLayout="dropdown" />
          <Text weight="heading">Date picker</Text>
          <DatePicker />
        </Stack>
      )
    },
  },
  {
    name: "Card",
    Component: () => (
      <Card style={{ maxWidth: 380 }}>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
          <CardAction>
            <Button variant="neutral" size="sm">
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Stack gap={12}>
            <Label>Email</Label>
            <Input placeholder="m@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Label>Password</Label>
            <Input secureTextEntry />
          </Stack>
        </CardContent>
        <CardFooter style={{ flexDirection: "column", gap: 8, alignItems: "stretch" }}>
          <Button>Login</Button>
          <Button variant="neutral">Login with Google</Button>
        </CardFooter>
      </Card>
    ),
  },
  {
    name: "Carousel",
    Component: () => (
      <View style={{ paddingHorizontal: 48 }}>
        <Carousel>
          <CarouselContent>
            {Array.from({ length: 5 }, (_, i) => (
              <CarouselItem key={i} style={{ padding: 4 }}>
                <Card style={{ aspectRatio: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text weight="heading" size="4xl">
                    {i + 1}
                  </Text>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <View style={{ height: 24 }} />
        <Carousel basis={1 / 2} opts={{ loop: true }}>
          <CarouselContent>
            {Array.from({ length: 6 }, (_, i) => (
              <CarouselItem key={i} style={{ padding: 6 }}>
                <Card size="sm" style={{ height: 100, alignItems: "center", justifyContent: "center" }}>
                  <Text weight="heading" size="2xl">
                    {i + 1}
                  </Text>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </View>
    ),
  },
  {
    name: "Chart",
    description: "Tap (or hover on web) a point or bar for the tooltip.",
    Component: () => (
      <Stack gap={24}>
        <Card>
          <CardHeader>
            <CardTitle>Bar Chart - Multiple</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={chartData} dataKey="month" xTickFormatter={(v) => v.slice(0, 3)} showLegend />
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Area Chart - Stacked</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart data={chartData} dataKey="month" stacked xTickFormatter={(v) => v.slice(0, 3)} />
              <ChartLegend />
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Line Chart - Dots</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={chartData} dataKey="month" dots xTickFormatter={(v) => v.slice(0, 3)} showYAxis />
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pie Chart - Donut</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                chrome: { label: "Chrome", color: "chart1" },
                safari: { label: "Safari", color: "chart2" },
                firefox: { label: "Firefox", color: "chart3" },
                edge: { label: "Edge", color: "chart4" },
                other: { label: "Other", color: "chart5" },
              }}
            >
              <PieChart
                data={[
                  { browser: "chrome", visitors: 275 },
                  { browser: "safari", visitors: 200 },
                  { browser: "firefox", visitors: 187 },
                  { browser: "edge", visitors: 173 },
                  { browser: "other", visitors: 90 },
                ]}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={0.55}
                centerLabel="925"
                showLegend
              />
            </ChartContainer>
          </CardContent>
        </Card>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} dataKey="month" horizontal series={["desktop"]} xTickFormatter={(v) => v.slice(0, 3)} />
        </ChartContainer>
      </Stack>
    ),
  },
  {
    name: "Checkbox",
    Component: () => (
      <Stack>
        <Row>
          <Checkbox defaultChecked accessibilityLabel="Accept terms" />
          <Label>Accept terms and conditions</Label>
        </Row>
        <Row>
          <Checkbox checked="indeterminate" accessibilityLabel="Indeterminate" />
          <Label>Indeterminate</Label>
        </Row>
        <Row>
          <Checkbox disabled accessibilityLabel="Disabled" />
          <Label disabled>Disabled</Label>
        </Row>
      </Stack>
    ),
  },
  {
    name: "Collapsible",
    Component: () => (
      <Collapsible style={{ gap: 8, maxWidth: 350 }}>
        <Row>
          <Text weight="heading" style={{ flex: 1 }}>
            @peduarte starred 3 repositories
          </Text>
          <CollapsibleTrigger asChild>
            <Button variant="noShadow" size="icon-sm" accessibilityLabel="Toggle">
              <ChevronsUpDownIcon />
            </Button>
          </CollapsibleTrigger>
        </Row>
        <Card size="sm" shadow={false} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
          <Text>@radix-ui/primitives</Text>
        </Card>
        <CollapsibleContent>
          <Stack gap={8}>
            <Card size="sm" shadow={false} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
              <Text>@radix-ui/colors</Text>
            </Card>
            <Card size="sm" shadow={false} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
              <Text>@stitches/react</Text>
            </Card>
          </Stack>
        </CollapsibleContent>
      </Collapsible>
    ),
  },
  {
    name: "Combobox",
    Component: () => (
      <Combobox
        placeholder="Select framework..."
        searchPlaceholder="Search framework..."
        emptyText="No framework found."
        options={[
          { value: "next.js", label: "Next.js" },
          { value: "sveltekit", label: "SvelteKit" },
          { value: "nuxt.js", label: "Nuxt.js" },
          { value: "remix", label: "Remix" },
          { value: "astro", label: "Astro" },
        ]}
      />
    ),
  },
  {
    name: "Command",
    Component: function CommandDemo() {
      const [open, setOpen] = React.useState(false)
      const items = (
        <>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => setOpen(false)}>
              <HomeIcon />
              <Text>Home</Text>
            </CommandItem>
            <CommandItem>
              <SearchIcon />
              <Text>Search</Text>
            </CommandItem>
            <CommandItem disabled>
              <StarIcon />
              <Text>Favorites (disabled)</Text>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <UserIcon />
              <Text>Profile</Text>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <MailIcon />
              <Text>Mail</Text>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SettingsIcon />
              <Text>Settings</Text>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </>
      )
      return (
        <Stack>
          <Command style={{ maxWidth: 450 }}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>{items}</CommandList>
          </Command>
          <Button onPress={() => setOpen(true)} style={{ alignSelf: "flex-start" }}>
            Open command dialog
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." autoFocus />
            <CommandList>{items}</CommandList>
          </CommandDialog>
        </Stack>
      )
    },
  },
  {
    name: "Context Menu",
    description: "Long-press the box (right-click on web).",
    Component: () => (
      <ContextMenu>
        <ContextMenuTrigger>
          <View
            style={{
              height: 150,
              maxWidth: 300,
              borderWidth: 2,
              borderStyle: "dashed",
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>Long press here</Text>
          </View>
        </ContextMenuTrigger>
        <ContextMenuContent style={{ width: 256 }}>
          <ContextMenuItem inset>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset disabled>
            Forward
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset>
            Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
            <ContextMenuSubContent style={{ width: 192 }}>
              <ContextMenuItem>Save Page As...</ContextMenuItem>
              <ContextMenuItem>Create Shortcut...</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Developer Tools</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem defaultChecked>Show Bookmarks Bar</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup defaultValue="pedro">
            <ContextMenuLabel inset>People</ContextMenuLabel>
            <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },
  {
    name: "Data Table",
    Component: () => {
      const columns: DataTableColumn<Payment>[] = [
        { key: "status", header: "Status", cell: (r) => <Text style={{ textTransform: "capitalize" }}>{r.status}</Text> },
        { key: "email", header: "Email", sortable: true, flex: 2 },
        {
          key: "amount",
          header: "Amount",
          align: "right",
          sortable: true,
          cell: (r) => <Text weight="heading">${r.amount.toFixed(2)}</Text>,
        },
      ]
      return (
        <DataTable
          data={payments}
          columns={columns}
          getRowId={(r) => r.id}
          filterKey="email"
          filterPlaceholder="Filter emails..."
          selectable
          pageSize={5}
          minWidth={560}
        />
      )
    },
  },
  {
    name: "Dialog",
    Component: () => (
      <Dialog>
        <DialogTrigger asChild>
          <Button style={{ alignSelf: "flex-start" }}>Edit Profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <Stack gap={12}>
            <Label>Name</Label>
            <Input defaultValue="Pedro Duarte" />
            <Label>Username</Label>
            <Input defaultValue="@peduarte" />
          </Stack>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="neutral">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onPress={() => toast.success("Profile saved")}>Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: "Direction",
    Component: () => (
      <Stack>
        <DirectionProvider direction="rtl">
          <Card size="sm">
            <CardHeader>
              <CardTitle>مرحبا</CardTitle>
              <CardDescription>This card is laid out right-to-left.</CardDescription>
            </CardHeader>
            <CardContent>
              <Row>
                <Button size="sm">أول</Button>
                <Button size="sm" variant="neutral">
                  ثاني
                </Button>
              </Row>
            </CardContent>
          </Card>
        </DirectionProvider>
      </Stack>
    ),
  },
  {
    name: "Drawer",
    description: "Swipe down to dismiss.",
    Component: () => (
      <Row>
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <View style={{ maxWidth: 384, width: "100%", alignSelf: "center" }}>
              <DrawerHeader>
                <DrawerTitle>Move Goal</DrawerTitle>
                <DrawerDescription>Set your daily activity goal.</DrawerDescription>
              </DrawerHeader>
              <View style={{ padding: 16, alignItems: "center" }}>
                <Text weight="heading" style={{ fontSize: 64, lineHeight: 72 }}>
                  350
                </Text>
                <Text>Calories/day</Text>
              </View>
              <DrawerFooter>
                <Button>Submit</Button>
                <DrawerClose asChild>
                  <Button variant="neutral">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </View>
          </DrawerContent>
        </Drawer>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="neutral">From right</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Side drawer</DrawerTitle>
              <DrawerDescription>Swipe right to dismiss.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </Row>
    ),
  },
  {
    name: "Dropdown Menu",
    Component: function DropdownDemo() {
      const [position, setPosition] = React.useState("bottom")
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button style={{ alignSelf: "flex-start" }}>Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent style={{ width: 224 }}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                <Text>Profile</Text>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                <Text>Settings</Text>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuCheckboxItem defaultChecked>Status Bar</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
              <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    name: "Empty",
    Component: () => (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>No messages yet</EmptyTitle>
          <EmptyDescription>When you receive messages they will show up here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Compose</Button>
        </EmptyContent>
      </Empty>
    ),
  },
  {
    name: "Field",
    Component: () => (
      <FieldSet style={{ maxWidth: 420 }}>
        <FieldLegend>Payment Method</FieldLegend>
        <FieldDescription>All transactions are secure and encrypted</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel>Name on Card</FieldLabel>
            <Input placeholder="Evil Rabbit" />
          </Field>
          <Field invalid>
            <FieldLabel>Card Number</FieldLabel>
            <Input placeholder="1234 5678 9012 3456" invalid keyboardType="number-pad" />
            <FieldError errors={[{ message: "Card number is invalid." }]} />
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field orientation="horizontal">
            <Checkbox defaultChecked accessibilityLabel="Same as shipping" />
            <FieldLabel>Same as shipping address</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    ),
  },
  {
    name: "Form",
    description: "Form-library agnostic; pass each field's error (works with react-hook-form's Controller).",
    Component: function FormDemo() {
      const [username, setUsername] = React.useState("")
      const [submitted, setSubmitted] = React.useState(false)
      const error = submitted && username.length < 2 ? "Username must be at least 2 characters." : undefined
      return (
        <Form style={{ maxWidth: 380 }}>
          <FormField name="username" error={error}>
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" value={username} onChangeText={setUsername} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button
            style={{ alignSelf: "flex-start" }}
            onPress={() => {
              setSubmitted(true)
              if (username.length >= 2) toast.success(`Submitted: ${username}`)
            }}
          >
            Submit
          </Button>
        </Form>
      )
    },
  },
  {
    name: "Hover Card",
    description: "Hover on web, long-press on mobile.",
    Component: () => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="noShadow" style={{ alignSelf: "flex-start" }}>
            @nextjs
          </Button>
        </HoverCardTrigger>
        <HoverCardContent style={{ width: 320 }}>
          <Row wrap={false}>
            <Avatar>
              <AvatarImage src="https://github.com/vercel.png" />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
            <View style={{ flex: 1, gap: 4 }}>
              <Text weight="heading" size="sm">
                @nextjs
              </Text>
              <Text size="sm">The React Framework – created and maintained by @vercel.</Text>
              <Text size="xs">Joined December 2021</Text>
            </View>
          </Row>
        </HoverCardContent>
      </HoverCard>
    ),
  },
  {
    name: "Image Card",
    Component: () => (
      <ImageCard caption="Image" imageUrl="https://picsum.photos/id/1015/500/375" />
    ),
  },
  {
    name: "Input",
    Component: () => (
      <Stack gap={12}>
        <Input placeholder="Email" style={{ maxWidth: 380 }} />
        <Input placeholder="Disabled" disabled style={{ maxWidth: 380 }} />
        <Input placeholder="Invalid" invalid style={{ maxWidth: 380 }} />
      </Stack>
    ),
  },
  {
    name: "Input Group",
    Component: () => (
      <Stack gap={12}>
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupText>12 results</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton accessibilityLabel="Copy" onPress={() => toast("Copied")}>
              <CopyIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Ask, search or chat..." />
          <InputGroupAddon align="block-end">
            <InputGroupText style={{ flex: 1 }}>52% used</InputGroupText>
            <Button size="icon-xs" accessibilityLabel="Send">
              <SendIcon />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </Stack>
    ),
  },
  {
    name: "Input OTP",
    Component: function OTPDemo() {
      const [value, setValue] = React.useState("")
      return (
        <Stack>
          <InputOTP maxLength={6} value={value} onChange={setValue} pattern={REGEXP_ONLY_DIGITS} onComplete={(v) => toast(`Code: ${v}`)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Text size="sm">{value ? `You entered: ${value}` : "Enter your one-time password."}</Text>
        </Stack>
      )
    },
  },
  {
    name: "Item",
    Component: () => (
      <ItemGroup style={{ maxWidth: 480 }}>
        <Item>
          <ItemMedia variant="icon">
            <InfoIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Basic Item</ItemTitle>
            <ItemDescription>A simple item with title and description.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="neutral">
              Action
            </Button>
          </ItemActions>
        </Item>
        <Item size="sm" onPress={() => toast("Item pressed")}>
          <ItemMedia variant="image">
            <Avatar size="sm" style={{ borderWidth: 0 }}>
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Pressable item</ItemTitle>
            <ItemDescription>Press me</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    ),
  },
  {
    name: "Kbd",
    Component: () => (
      <Row>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌥</Kbd>
          <Kbd>⌃</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Text>+</Text>
          <Kbd>B</Kbd>
        </KbdGroup>
      </Row>
    ),
  },
  {
    name: "Label",
    Component: () => (
      <Row>
        <Checkbox accessibilityLabel="terms" />
        <Label>Accept terms and conditions</Label>
      </Row>
    ),
  },
  {
    name: "Marker",
    Component: () => (
      <Stack>
        <Marker>
          <MarkerIcon>
            <InfoIcon />
          </MarkerIcon>
          <MarkerContent>Default marker with an icon</MarkerContent>
        </Marker>
        <Marker variant="separator">
          <MarkerContent>Today</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerContent>Bordered marker</MarkerContent>
        </Marker>
      </Stack>
    ),
  },
  {
    name: "Marquee",
    Component: () => <Marquee items={["item1", "item2", "item3", "item4", "item5"]} />,
  },
  {
    name: "Menubar",
    Component: () => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              New Window <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>New Incognito Window</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email link</MenubarItem>
                <MenubarItem>Messages</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>
              Print... <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
            <MenubarCheckboxItem defaultChecked>Always Show Full URLs</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Profiles</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup defaultValue="benoit">
              <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
              <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
              <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
  },
  {
    name: "Message",
    Component: () => (
      <MessageGroup>
        <Message>
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Assistant · 10:24</MessageHeader>
            <Bubble variant="secondary">
              <BubbleContent>How can I help you today?</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>Show me the new components!</BubbleContent>
            </Bubble>
            <MessageFooter>Delivered</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    ),
  },
  {
    name: "Message Scroller",
    description: "Sticks to the newest message; scroll up to reveal the jump button.",
    Component: function ScrollerDemo() {
      const [messages, setMessages] = React.useState(
        Array.from({ length: 12 }, (_, i) => ({ id: i, mine: i % 2 === 1, text: `Message number ${i + 1}` })),
      )
      return (
        <Stack>
          <View style={{ height: 360, borderWidth: 2, borderRadius: 5 }}>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent style={{ padding: 16, gap: 12 }}>
                  {messages.map((m) => (
                    <MessageScrollerItem key={m.id}>
                      <Bubble align={m.mine ? "end" : "start"} variant={m.mine ? "default" : "secondary"}>
                        <BubbleContent>{m.text}</BubbleContent>
                      </Bubble>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </View>
          <Button
            style={{ alignSelf: "flex-start" }}
            onPress={() => setMessages((ms) => [...ms, { id: ms.length, mine: ms.length % 2 === 1, text: `Message number ${ms.length + 1}` }])}
          >
            Add message
          </Button>
        </Stack>
      )
    },
  },
  {
    name: "Native Select",
    description: "A real <select> on web, a bottom-sheet picker on iOS/Android.",
    Component: () => (
      <NativeSelect placeholder="Select a fruit">
        <NativeSelectOptGroup label="Fruits">
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
          <NativeSelectOption value="banana">Banana</NativeSelectOption>
          <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Vegetables">
          <NativeSelectOption value="carrot">Carrot</NativeSelectOption>
          <NativeSelectOption value="potato" disabled>
            Potato
          </NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    ),
  },
  {
    name: "Navigation Menu",
    Component: () => (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent style={{ width: 300 }}>
              <NavigationMenuLink>
                <Text weight="heading">Introduction</Text>
                <Text size="sm">Re-usable components built with React Native.</Text>
              </NavigationMenuLink>
              <NavigationMenuLink>
                <Text weight="heading">Installation</Text>
                <Text size="sm">How to install dependencies and structure your app.</Text>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent style={{ width: 260 }}>
              {["Alert Dialog", "Hover Card", "Progress", "Tabs"].map((c) => (
                <NavigationMenuLink key={c}>
                  <Text weight="heading">{c}</Text>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
  },
  {
    name: "Pagination",
    Component: () => (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
  },
  {
    name: "Popover",
    Component: () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button style={{ alignSelf: "flex-start" }}>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </PopoverHeader>
          <Stack gap={8}>
            {["Width", "Max. width", "Height"].map((l) => (
              <Row key={l} wrap={false}>
                <Label style={{ width: 90 }}>{l}</Label>
                <Input defaultValue="100%" style={{ flex: 1, minHeight: 32, paddingVertical: 4 }} />
              </Row>
            ))}
          </Stack>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    name: "Progress",
    Component: function ProgressDemo() {
      const [v, setV] = React.useState(13)
      React.useEffect(() => {
        const t = setTimeout(() => setV(66), 500)
        return () => clearTimeout(t)
      }, [])
      return (
        <Stack>
          <Progress value={v} style={{ maxWidth: 380 }} />
          <Progress value={v} style={{ maxWidth: 380 }}>
            <ProgressLabel>Upload</ProgressLabel>
            <ProgressValue />
          </Progress>
        </Stack>
      )
    },
  },
  {
    name: "Questionnaire",
    Component: () => (
      <Questionnaire
        items={[{ name: "role", required: true }, { name: "tools" }, { name: "feedback" }]}
        onSubmit={(v) => toast.success("Thanks!", { description: JSON.stringify(v) })}
        style={{ maxWidth: 440 }}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="role" required>
          <QuestionnaireTitle>What best describes you?</QuestionnaireTitle>
          <QuestionnaireDescription>Pick one.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="designer" shortcut="1">Designer</QuestionnaireChoice>
            <QuestionnaireChoice value="developer" shortcut="2">Developer</QuestionnaireChoice>
            <QuestionnaireChoice value="founder" shortcut="3">Founder</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="tools" type="checkbox">
          <QuestionnaireTitle>Which platforms do you ship to?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="ios">iOS</QuestionnaireChoice>
            <QuestionnaireChoice value="android">Android</QuestionnaireChoice>
            <QuestionnaireChoice value="web">Web</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="feedback" type="text">
          <QuestionnaireTitle>Anything else?</QuestionnaireTitle>
          <QuestionnaireInput placeholder="Your feedback" />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
    ),
  },
  {
    name: "Radio Group",
    Component: () => (
      <RadioGroup defaultValue="comfortable">
        {["default", "comfortable", "compact"].map((v) => (
          <Row key={v}>
            <RadioGroupItem value={v} accessibilityLabel={v} />
            <Label style={{ textTransform: "capitalize" }}>{v}</Label>
          </Row>
        ))}
      </RadioGroup>
    ),
  },
  {
    name: "Resizable",
    description: "Drag the handles.",
    Component: () => (
      <View style={{ height: 260, maxWidth: 480, borderWidth: 2, borderRadius: 5, overflow: "hidden" }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text weight="heading">One</Text>
            </View>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={25} minSize={15}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text weight="heading">Two</Text>
                </View>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text weight="heading">Three</Text>
                </View>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </View>
    ),
  },
  {
    name: "Scroll Area",
    Component: () => (
      <ScrollArea containerStyle={{ height: 288, width: 200, borderWidth: 2, borderRadius: 5 }}>
        <View style={{ padding: 16, gap: 8 }}>
          <Text weight="heading">Tags</Text>
          {Array.from({ length: 40 }, (_, i) => (
            <Text key={i} size="sm">
              v1.2.0-beta.{40 - i}
            </Text>
          ))}
        </View>
      </ScrollArea>
    ),
  },
  {
    name: "Select",
    Component: () => (
      <View style={{ maxWidth: 220 }}>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectSeparator />
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple" disabled>
                Pineapple
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    ),
  },
  {
    name: "Sheet",
    Component: () => (
      <Row>
        {(["right", "left", "top", "bottom"] as const).map((side) => (
          <Sheet key={side}>
            <SheetTrigger asChild>
              <Button variant={side === "right" ? "default" : "neutral"} textStyle={{ textTransform: "capitalize" }}>
                {side}
              </Button>
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader>
                <SheetTitle>Edit profile</SheetTitle>
                <SheetDescription>Make changes to your profile here.</SheetDescription>
              </SheetHeader>
              <View style={{ paddingHorizontal: 16, gap: 12 }}>
                <Label>Name</Label>
                <Input defaultValue="Pedro Duarte" />
              </View>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Save changes</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </Row>
    ),
  },
  {
    name: "Sidebar",
    description: "Wide screens: collapsible column (icon mode). Phones: slide-over panel.",
    Component: function SidebarDemo() {
      const [active, setActive] = React.useState("Home")
      const items = [
        { title: "Home", Icon: HomeIcon },
        { title: "Inbox", Icon: InboxIcon, badge: "24" },
        { title: "Search", Icon: SearchIcon },
        { title: "Settings", Icon: SettingsIcon },
      ]
      return (
        <View style={{ height: 420, borderWidth: 2, borderRadius: 5, overflow: "hidden" }}>
          <SidebarProvider>
            <Sidebar collapsible="icon">
              <SidebarHeader>
                <Text weight="heading" numberOfLines={1}>
                  Acme Inc
                </Text>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Application</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map(({ title, Icon, badge }) => (
                        <SidebarMenuItem key={title}>
                          <SidebarMenuButton isActive={active === title} onPress={() => setActive(title)}>
                            <Icon />
                            <Text>{title}</Text>
                          </SidebarMenuButton>
                          {badge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
                        </SidebarMenuItem>
                      ))}
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>Sub item</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenuButton>
                  <UserIcon />
                  <Text>Account</Text>
                </SidebarMenuButton>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset style={{ padding: 16, gap: 12 }}>
              <SidebarTrigger />
              <Text weight="heading" size="xl">
                {active}
              </Text>
              <Text>Content area.</Text>
            </SidebarInset>
          </SidebarProvider>
        </View>
      )
    },
  },
  {
    name: "Skeleton",
    Component: () => (
      <Row>
        <Skeleton style={{ width: 48, height: 48, borderRadius: 9999 }} />
        <Stack gap={8}>
          <Skeleton style={{ height: 16, width: 220 }} />
          <Skeleton style={{ height: 16, width: 170 }} />
        </Stack>
      </Row>
    ),
  },
  {
    name: "Slider",
    Component: function SliderDemo() {
      const [v, setV] = React.useState([33])
      const [range, setRange] = React.useState([25, 75])
      return (
        <Stack gap={24}>
          <Text>Value: {v[0]}</Text>
          <Slider value={v} onValueChange={setV} style={{ maxWidth: 380 }} />
          <Text>
            Range: {range[0]} – {range[1]}
          </Text>
          <Slider value={range} onValueChange={setRange} step={5} style={{ maxWidth: 380 }} />
        </Stack>
      )
    },
  },
  {
    name: "Spinner",
    Component: () => (
      <Row>
        <Spinner />
        <Spinner size={24} />
        <Button disabled>
          <Spinner />
          Please wait
        </Button>
      </Row>
    ),
  },
  {
    name: "Switch",
    Component: () => (
      <Stack>
        <Row>
          <Switch accessibilityLabel="Airplane mode" />
          <Label>Airplane Mode</Label>
        </Row>
        <Row>
          <Switch size="sm" defaultChecked accessibilityLabel="Small" />
          <Label>Small</Label>
        </Row>
      </Stack>
    ),
  },
  {
    name: "Table",
    Component: () => (
      <Table minWidth={480}>
        <TableHeader>
          <TableRow>
            <TableHead style={{ flex: 0, width: 100 }}>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead style={{ alignItems: "flex-end" }}>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ["INV001", "Paid", "Credit Card", "$250.00"],
            ["INV002", "Pending", "PayPal", "$150.00"],
            ["INV003", "Unpaid", "Bank Transfer", "$350.00"],
            ["INV004", "Paid", "Credit Card", "$450.00"],
          ].map(([inv, status, method, amount], i) => (
            <TableRow key={inv} selected={i === 1}>
              <TableCell style={{ flex: 0, width: 100 }} textStyle={{ fontWeight: "700" }}>
                {inv}
              </TableCell>
              <TableCell>{status}</TableCell>
              <TableCell>{method}</TableCell>
              <TableCell style={{ alignItems: "flex-end" }}>{amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell style={{ flex: 3 }}>Total</TableCell>
            <TableCell style={{ alignItems: "flex-end" }}>$1,200.00</TableCell>
          </TableRow>
        </TableFooter>
        <TableCaption>A list of your recent invoices.</TableCaption>
      </Table>
    ),
  },
  {
    name: "Tabs",
    Component: () => (
      <Stack gap={24}>
        <Tabs defaultValue="account" style={{ maxWidth: 400 }}>
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Make changes to your account here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input defaultValue="Pedro Duarte" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input secureTextEntry placeholder="New password" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Tabs defaultValue="overview">
          <TabsList variant="line" style={{ alignSelf: "flex-start" }}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Text>Line variant – overview</Text>
          </TabsContent>
          <TabsContent value="analytics">
            <Text>Analytics</Text>
          </TabsContent>
          <TabsContent value="reports">
            <Text>Reports</Text>
          </TabsContent>
        </Tabs>
      </Stack>
    ),
  },
  {
    name: "Textarea",
    Component: () => <Textarea placeholder="Type your message here." style={{ maxWidth: 420 }} />,
  },
  {
    name: "Toast",
    Component: () => (
      <Row>
        <Button onPress={() => toast("Event has been created", { description: "Sunday, December 03, 2023 at 9:00 AM" })}>Default</Button>
        <Button variant="neutral" onPress={() => toast.success("Saved!")}>
          Success
        </Button>
        <Button variant="neutral" onPress={() => toast.error("Something went wrong")}>
          Error
        </Button>
        <Button
          variant="neutral"
          onPress={() => toast("File deleted", { action: { label: "Undo", onPress: () => toast("Restored") } })}
        >
          With action
        </Button>
        <Button
          variant="neutral"
          onPress={() =>
            toast.promise(new Promise((r) => setTimeout(r, 1500)), {
              loading: "Uploading…",
              success: "Uploaded",
              error: "Failed",
            })
          }
        >
          Promise
        </Button>
      </Row>
    ),
  },
  {
    name: "Toggle",
    Component: () => (
      <Row>
        <Toggle accessibilityLabel="Toggle bold">
          <BoldIcon />
        </Toggle>
        <Toggle defaultPressed size="sm">
          <ItalicIcon />
          Italic
        </Toggle>
        <Toggle size="lg" disabled>
          <UnderlineIcon />
        </Toggle>
      </Row>
    ),
  },
  {
    name: "Toggle Group",
    Component: () => (
      <Stack>
        <ToggleGroup multiple defaultValue={["bold"]}>
          <ToggleGroupItem value="bold" accessibilityLabel="Bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" accessibilityLabel="Italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" accessibilityLabel="Underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup spacing={0} defaultValue={["center"]}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </Stack>
    ),
  },
  {
    name: "Tooltip",
    description: "Hover on web, long-press on mobile.",
    Component: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="neutral" style={{ alignSelf: "flex-start" }}>
            Hover
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <Text>Add to library</Text>
        </TooltipContent>
      </Tooltip>
    ),
  },
]
